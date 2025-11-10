const AttendanceRepositories = require('../Repositories/AttendanceRepositories');

class AttendanceServices {

    static add = async (userObj) => {
        return await AttendanceRepositories.create(userObj);
    }

    static getAttendances = async () => {
        return await AttendanceRepositories.getAll();
    }

    static getAttendance = async (attendanceId) => {
        return await AttendanceRepositories.get(attendanceId);
    }

    static getAttendanceByName = async (attendanceName, trainerId) => {
        return await AttendanceRepositories.getAttendanceByName(attendanceName, trainerId);
    }

    static getAttendanceByTrainer = async (trainerId) => {
        return await AttendanceRepositories.getAttendanceByTrainer(trainerId);
    }

    static getAttendanceUserCount = async (data) => {
        return await AttendanceRepositories.getAttendanceUserCount(data);
    }

    static checkGoogleToken = async () => {
        return await AttendanceRepositories.checkGoogleToken();
    }

    static googleAuthReq = async () => {
        return await AttendanceRepositories.googleAuthReq();
    }

    static redirectURL = async (req) => {
        return await AttendanceRepositories.redirectURL(req);
    }

    // static update = async (attendanceId, action, update) => {
    //     return await AttendanceRepositories.update(attendanceId, action, update);
    // }

}

module.exports = AttendanceServices;