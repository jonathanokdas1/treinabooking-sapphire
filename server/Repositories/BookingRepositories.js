const db = require('../Models');
const { Op } = require('sequelize');
const { google } = require('googleapis');
const open = require('open');
const moment = require('moment');
const dayjs = require('dayjs');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const WalletRepositories = require('./WalletRepositories');
const { string } = require('joi');

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

function sendCalendarInvite(booking) {
    return new Promise((resolve, reject) => {
        db.Booking.findOne({
            where: { id: booking.id },
            include: [
                { model: db.User, as: 'trainerDetails', attributes: ['id', 'email'] },
                { model: db.User, as: 'createdByDetails', attributes: ['id', 'email'] },
            ],
        }).then(bookingData => {
            const bookingUsersArray = (typeof bookingData.users === "string") ? JSON.parse(bookingData.users) : bookingData.users;
            const idArray = bookingUsersArray.map(obj => obj.id);
            db.User.findAll({ where: { id: { [Op.in]: idArray } }, attributes: ['id', 'email'] }).then(users => {
                const userEmail = users.map((u) => ({ email: u.email }));
                const eventStartDate = new Date(bookingData.dataValues.startDate);
                const eventEndDate = new Date(bookingData.dataValues.endDate);

                const eventReq = {
                    'summary': bookingData.title ? bookingData.title : "TreinaBooking Session",
                    'description': 'Please be on time for the session.',
                    'start': {
                        dateTime: eventStartDate.toISOString(),
                        timeZone: config.dateTimeZone
                    },
                    'end': {
                        dateTime: eventEndDate.toISOString(),
                        timeZone: config.dateTimeZone
                    },
                    'attendees': userEmail,
                    "creator": {
                        "email": bookingData.dataValues.trainerDetails.dataValues.email,
                        "self": true
                    },
                    "organizer": {
                        "email": bookingData.dataValues.createdByDetails.dataValues.email,
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
                };

                calendar.events.insert({
                    calendarId: "primary",
                    auth: oauth2Client,
                    requestBody: eventReq,
                    sendUpdates: "all",
                    sendNotifications: true
                }).then(response => {
                    resolve(response);
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
}

function updateCalendarInvite(booking) {
    return new Promise((resolve, reject) => {
        db.Booking.findOne({
            where: { id: booking.id },
            include: [
                { model: db.User, as: 'trainerDetails', attributes: ['id', 'email'] },
                { model: db.User, as: 'createdByDetails', attributes: ['id', 'email'] },
            ],
        }).then(bookingData => {
            const bookingUsersArray = (typeof bookingData.users === "string") ? JSON.parse(bookingData.users) : bookingData.users;
            const idArray = bookingUsersArray.map(obj => obj.id);
            db.User.findAll({ where: { id: { [Op.in]: idArray } }, attributes: ['id', 'email'] }).then(users => {
                const userEmail = users.map((u) => ({ email: u.email }));
                const eventStartDate = new Date(bookingData.dataValues.startDate);
                const eventEndDate = new Date(bookingData.dataValues.endDate);

                const eventReq = {
                    'summary': bookingData.title ? bookingData.title : "TreinaBooking Session",
                    'description': 'Please be on time for the session.',
                    'start': {
                        dateTime: eventStartDate.toISOString(),
                        timeZone: config.dateTimeZone
                    },
                    'end': {
                        dateTime: eventEndDate.toISOString(),
                        timeZone: config.dateTimeZone
                    },
                    'attendees': userEmail,
                    "creator": {
                        "email": bookingData.dataValues.trainerDetails.dataValues.email,
                        "self": true
                    },
                    "organizer": {
                        "email": bookingData.dataValues.createdByDetails.dataValues.email,
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
                };

                calendar.events.update({
                    auth: oauth2Client,
                    calendarId: "primary",
                    eventId: bookingData.dataValues.inviteId,
                    resource: eventReq,
                    sendUpdates: "all",
                    sendNotifications: true
                }).then(response => {
                    resolve(response);
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
}


function formatDateTime(dateTimeString) {
    const convertedDate = moment.utc(dateTimeString).tz(config.dateTimeZone);
    const formattedDate = convertedDate.format('YYYY-MM-DD HH:mm:ss');
    return formattedDate;
}

function deleteEvent(eventId) {
    return new Promise((resolve, reject) => {

        const params = {
            auth: oauth2Client,
            calendarId: "primary",
            eventId: eventId,
            sendUpdates: "all",
            sendNotifications: true
        }

        calendar.events.delete(params, function (err) {
            if (err) {
                reject(err);
            }
            resolve('Event deleted.');
        });

    })
}

class BookingRepositories {

    static create = async (bookingData) => new Promise((resolve, reject) => {
        bookingData.userCount = bookingData.users.length;
        bookingData.startDate = new Date(bookingData.startDate);
        bookingData.endDate = new Date(bookingData.endDate);

        db.Booking.create(bookingData).then(async (bookingData) => {
            sendCalendarInvite(bookingData).then(googleCalendarRes => {
                bookingData.update({ inviteId: googleCalendarRes.data.id })
                resolve(bookingData);
            }).catch(err => {
                reject(err ? err : 'Error, While send Google Calendar Invite');
            })
        }).catch((error) => {
            console.log(error)
            reject(error);
        });
    });

    static getAll = () => new Promise((resolve, reject) => {
        db.Booking.findAll({
            where: { bookedAttendance: false },
            include: [
                { model: db.User, as: 'trainerDetails', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: db.User, as: 'createdByDetails', attributes: ['id', 'firstName', 'lastName', 'email'] },
            ],
        }).then(async (bookings) => {
            if (bookings.length) {
                const bookingWithUsers = await Promise.all(
                    bookings.map(async booking => {
                        const bookingUsersArray = (typeof booking.users === "string") ? JSON.parse(booking.users) : booking.users;
                        const idArray = bookingUsersArray.map(obj => obj.id);
                        const users = await db.User.findAll({ where: { id: { [Op.in]: idArray } }, attributes: ['id', 'firstName', 'lastName', 'email'] });
                        const modifiedbooking = { ...booking.toJSON(), users: users };
                        return modifiedbooking;
                    })
                );
                const convertedEvents = bookingWithUsers.map(event => {
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
                            calendar: 'Family',
                            guests: users,
                            location: 'studio',
                            description: ''
                        }
                    };
                });
                resolve(convertedEvents);
            } else {
                resolve(bookings);
            }
        })
            .catch((error) => {
                reject(error);
            });
    });

    static get = (bookingId) => new Promise((resolve, reject) => {
        db.Booking.findOne({
            where: { id: bookingId },
            include: [
                { model: db.User, as: 'trainerDetails', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: db.User, as: 'createdByDetails', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        })
            .then(async (booking) => {
                if (booking) {
                    const bookingUsersArray = (typeof booking.users === "string") ? JSON.parse(booking.users) : booking.users;
                    const idArray = bookingUsersArray.map(item => item.id);
                    const users = await db.User.findAll({ where: { id: { [Op.in]: idArray } }, attributes: ['id', 'firstName', 'lastName', 'email'] });

                    const userDetailsMap = {};
                    users.forEach((user) => {
                        userDetailsMap[user.id] = user.dataValues;
                    });

                    // Modify the attendance object to set user details
                    const modifiedBooking = {
                        ...booking.toJSON(),
                        users: bookingUsersArray.map((user) => ({
                            ...userDetailsMap[user.id]
                        }))
                    };
                    const finalDetails = {
                        id: modifiedBooking.id,
                        title: modifiedBooking.title || '',
                        start: formatDateTime(modifiedBooking.startDate) || '',
                        end: formatDateTime(modifiedBooking.endDate) || '',
                        allDay: false,
                        url: '',
                        trainer: modifiedBooking.trainerDetails,
                        createdBy: modifiedBooking.createdByDetails,
                        extendedProps: {
                            calendar: 'Family',
                            guests: users,
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

    static findByPk = (bookingId) => new Promise((resolve, reject) => {
        db.Booking.findByPk(bookingId).then(bookingData => {
            resolve(bookingData);
        }).catch(err => {
            reject(err);
        })
    });

    static getAssessmentByTrainer = (trainerId) => new Promise((resolve, reject) => {
        db.Booking.findAll({ where: { trainer: trainerId } })
            .then((booking) => {
                booking.users = (typeof booking.users === 'string') ? JSON.parse(booking.users) : booking.users;
                resolve(booking);
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
        if (req.query.code) {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            return "Now You can use google calendar service to add booking.";
        } else {
            return "Something went wrong.";
        }
    }

    static getBookingUserCount = (data) => new Promise((resolve, reject) => {
        db.Booking.findAll({ where: { trainer: data.trainer, startDate: data.startDate, endDate: data.endDate } })
            .then((bookings) => {
                const totalUsers = bookings.reduce((count, item) => count + ((typeof item.users === "string") ? JSON.parse(item.users) : item.users).length, 0);
                resolve(totalUsers);
            })
            .catch((error) => {
                reject(error);
            });
    });

    static update = (data) => new Promise((resolve, reject) => {
        const { bookingId, startDate, endDate, users, title, trainer } = data;

        db.Booking.findByPk(bookingId).then(booking => {
            let updateQuery = {};

            if (title) updateQuery.title = title;
            if (users) {
                let reqUsers = (typeof users === "string") ? JSON.parse(users) : users;
                const uniqueUsers = {};
                const result = reqUsers.filter(user => {
                    const id = user.id;
                    if (!uniqueUsers[id]) {
                        uniqueUsers[id] = true;
                        return true;
                    }
                    return false;
                });
                updateQuery.users = result;
                updateQuery.userCount = result.length;
            }

            if (startDate) updateQuery.startDate = new Date(startDate);
            if (endDate) updateQuery.endDate = new Date(endDate);
            if (trainer) updateQuery.trainer = trainer;

            booking.update(updateQuery).then(updatedData => {
                updatedData.users = (typeof updatedData.users === 'string') ? JSON.parse(updatedData.users) : updatedData.users;
                updateCalendarInvite(updatedData).then(googleCalResp => {
                    resolve(updatedData);
                }).catch(err => {
                    reject(err);
                })
            }).catch((err) => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        })
    })

    static delete = (data) => new Promise((resolve, reject) => {
        const { bookingId } = data;

        db.Booking.findByPk(bookingId).then(booking => {
            deleteEvent(booking.inviteId).then(data => {
                booking.update({ delete: true }).then(deletedBooking => {
                    resolve(deletedBooking)
                }).catch(err => {
                    reject({ error: err ? err : 'Booking not found' });
                })
            }).catch(err => {
                reject(err);
            })
        }).catch(err => {
            reject({ error: err });
        })

    });

    static checkBookingExists = (data) => new Promise((resolve, reject) => {
        try {
            const existingBooking = db.Booking.findOne({
                where: {
                    [Op.and]: [
                        { startDate: { [Op.lte]: data.endDate } },
                        { endDate: { [Op.gte]: data.startDate } }
                    ]
                }
            });

            resolve(existingBooking);
        } catch (error) {
            console.error("Error checking booking:", error);
            reject(error);
        }
    })

}

module.exports = BookingRepositories;