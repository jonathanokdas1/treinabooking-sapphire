const db = require('../Models');
const { Op } = require('sequelize');
const { google } = require('googleapis');
const open = require('open');
const moment = require('moment');
const dayjs = require('dayjs');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const WalletRepositories = require('./WalletRepositories');

const calendar = google.calendar({
    version: config.GOOGLE_VERSION,
    auth: config.GOOGLE_API_KEY
});

const scopes = [
    'https://www.googleapis.com/auth/calendar'
];

const oauth2Client = new google.auth.OAuth2(
    config.GOOGLE_SERVICE_CLIENT_ID,
    config.GOOGLE_SERVICE_CLIENT_SECRET,
    config.GOOGLE_SERVICE_REDIRECT_URL
);

function isTokenExpired() {
    try {
        const { credentials } = oauth2Client;
        const expiryTime = credentials.expiry_date;
        if (expiryTime) {
            const currentTime = Date.now() / 1000;
            const isExpired = currentTime >= expiryTime * 1000;
            if (isExpired) {
                return "Token has expired.";
            } else {
                return "Token is still valid.";
            }
        } else {
            return "Token has expired.";
        }
    } catch (error) {
        console.error("Error checking token expiry:", error);
        return false; // Treat any error as an expired token
    }
}

async function sendCalendarInvite(attendance) {
    await db.Attendance.findOne({
        where: { id: attendance.id },
        include: [
            { model: db.User, as: 'trainerDetails', attributes: ['id', 'email'] },
            { model: db.User, as: 'createdByDetails', attributes: ['id', 'email'] },
        ],
    }).then(async attendanceData => {
        const attendanceUsersArray = (typeof attendanceData.users === "string") ? JSON.parse(attendanceData.users) : attendanceData.users;
        const idArray = attendanceUsersArray.map(obj => obj.id);
        db.User.findAll({ where: { id: { [Op.in]: idArray } }, attributes: ['id', 'email'] }).then(users => {
            const userEmail = users.map((u) => ({ email: u.email }));
            const eventReq = {
                'summary': attendanceData.title ? attendanceData.title : "TreinaBooking Session",
                'description': 'Please be on time for the session.',
                // 'recurrence': [
                //     'RRULE:FREQ=DAILY;COUNT=3'
                // ],

                'start': {
                    dateTime: dayjs(new Date()).toISOString(),
                    timeZone: 'Asia/Kolkata'
                },
                'end': {
                    dateTime: dayjs(new Date()).add(1, "hours").toISOString(),
                    timeZone: 'Asia/Kolkata'
                },
                'attendees': userEmail,
                "creator": {
                    "email": attendanceData.dataValues.trainerDetails.dataValues.email,
                    "self": true
                },
                "organizer": {
                    "email": attendanceData.dataValues.createdByDetails.dataValues.email,
                    "self": true
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        {
                            method: "email",
                            minutes: 15,
                        },
                        {
                            method: "email",
                            minutes: 60,
                        },
                        {
                            method: "popup",
                            minutes: 10,
                        },
                    ]
                },
                colorId: 4,
                status: "confirmed",
            }

            return calendar.events.insert({
                calendarId: "primary",
                auth: oauth2Client,
                requestBody: eventReq,
                sendUpdates: "all",
                sendNotifications: true

            });
        }).catch(err => {
            return err;
        })

    }).catch(err => {
        return err;
    })
}

function formatDateTime(dateTimeString) {
    const convertedDate = moment.utc(dateTimeString).tz(config.dateTimeZone);
    const formattedDate = convertedDate.format('YYYY-MM-DD HH:mm:ss');
    return formattedDate;
}

class AttendanceRepositories {

    static create = async (attendanceData) => new Promise((resolve, reject) => {
        attendanceData.startDate = new Date(attendanceData.startDate);
        attendanceData.endDate = new Date(attendanceData.endDate);
        WalletRepositories.checkBulkUserWallet(attendanceData.users).then(users => {
            attendanceData.users = users;
            db.Attendance.create(attendanceData).then(async (createdAttendance) => {

                const idArray = createdAttendance.users.map(item => item.id);
                const modifiedAttendance = { ...createdAttendance.toJSON(), userIds: idArray };
                WalletRepositories.updateWallet(modifiedAttendance);

                const userWalletUpdate = WalletRepositories.checkBulkUserWallet(modifiedAttendance.users);
                db.Booking.findOne({ where: { id: attendanceData.bookingId } }).then(async (bookingDAta) => {
                    bookingDAta.update({ bookedAttendance: true });
                    // sendCalendarInvite(attendanceData);
                    if (userWalletUpdate.length) {
                        resolve(userWalletUpdate);
                    } else {
                        resolve(createdAttendance);
                    }
                });
            }).catch((error) => {
                reject(error);
            });
        }).catch(err => {
            reject(err)
        })
    });

    static getAll = () => new Promise((resolve, reject) => {
        db.Attendance.findAll({
            include: [
                { model: db.User, as: 'trainerDetails', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: db.User, as: 'createdByDetails', attributes: ['id', 'firstName', 'lastName', 'email'] },
            ],
        }).then(async (attendances) => {
            if (attendances.length) {
                const attendanceWithUsers = await Promise.all(
                    attendances.map(async attendance => {
                        const attendanceUsersArray = (typeof attendance.users === "string") ? JSON.parse(attendance.users) : attendance.users;
                        const idArray = attendanceUsersArray.map(obj => obj.id);
                        const users = await db.User.findAll({ where: { id: { [Op.in]: idArray } }, attributes: ['id', 'firstName', 'lastName', 'email'] });
                        const modifiedAttendance = { ...attendance.toJSON(), users: users };
                        return modifiedAttendance;
                    })
                );
                const convertedEvents = attendanceWithUsers.map(event => {
                    const { id, title, startDate, endDate, users, trainerDetails, createdByDetails } = event;
                    return {
                        id: id,
                        title: title || '',
                        start: formatDateTime(startDate) || '',
                        end: formatDateTime(endDate) || '',
                        allDay: false,
                        url: '',
                        trainer: trainerDetails,
                        createdBy: createdByDetails,
                        extendedProps: {
                            calendar: 'Business',
                            guests: users,
                            location: 'studio',
                            description: ''
                        }
                    };
                });
                resolve(convertedEvents);
            } else {
                resolve(attendances);
            }
        })
            .catch((error) => {
                reject(error);
            });
    });

    static get = (attendanceId) => new Promise((resolve, reject) => {
        db.Attendance.findOne({
            where: { id: attendanceId },
            include: [
                { model: db.User, as: 'trainerDetails', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: db.User, as: 'createdByDetails', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        })
            .then(async (attendance) => {
                if (attendance) {
                    const attendanceUsersArray = (typeof attendance.users === "string") ? JSON.parse(attendance.users) : attendance.users;
                    const idArray = attendanceUsersArray.map(item => item.id);
                    const users = await db.User.findAll({ where: { id: { [Op.in]: idArray } }, attributes: ['id', 'firstName', 'lastName', 'email'] });

                    const userDetailsMap = {};
                    users.forEach((user) => {
                        userDetailsMap[user.id] = user.dataValues;
                    });

                    // Modify the attendance object to set user details
                    const modifiedAttendance = {
                        ...attendance.toJSON(),
                        users: attendanceUsersArray.map((user) => ({
                            ...userDetailsMap[user.id],
                            sign: user.sign,
                        }))
                    };
                    const finalDetails = {
                        id: modifiedAttendance.id,
                        title: modifiedAttendance.title || '',
                        start: formatDateTime(modifiedAttendance.startDate) || '',
                        end: formatDateTime(modifiedAttendance.endDate) || '',
                        allDay: false,
                        url: '',
                        trainer: modifiedAttendance.trainerDetails,
                        createdBy: modifiedAttendance.createdByDetails,
                        extendedProps: {
                            calendar: 'Business',
                            guests: modifiedAttendance,
                            location: 'studio',
                            description: ''
                        }
                    };
                    resolve(finalDetails);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });

    static getAssessmentByTrainer = (trainerId) => new Promise((resolve, reject) => {
        db.Attendance.findAll({ where: { trainer: trainerId } })
            .then((assessment) => {
                resolve(assessment);
            })
            .catch((error) => {
                reject(error);
            });
    });

    static getAttendanceUserCount = (data) => new Promise((resolve, reject) => {
        db.Attendance.findAll({ where: { trainer: data.trainer, startDate: data.startDate, endDate: data.endDate } })
            .then((assessment) => {
                const totalUsers = assessment.reduce((count, item) => count + ((typeof item.users === "string") ? JSON.parse(item.users) : item.users).length, 0);
                resolve(totalUsers);
            })
            .catch((error) => {
                reject(error);
            });
    });

    static checkGoogleToken = () => new Promise((resolve, reject) => {
        const isValid = isTokenExpired();
        resolve(isValid);
    })

    static googleAuthReq = () => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
        return url;
    }

    static redirectURL = async (req) => {
        const code = req.query.code;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return "Now You can use google calendar service to add attendance.";
    }

}

module.exports = AttendanceRepositories;