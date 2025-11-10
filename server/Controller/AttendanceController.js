const AttendanceServices = require('../Services/AttendanceServices');

function isValidUser(user) {
  return user.id !== undefined && user.sign !== undefined;
}

class AttendanceController {

  static add = async (req, res) => {
    try {
      if (req.body) {
        if (!req.body.bookingId) return res.status(400).json({ message: 'Please, provide bookingId' });
        if (!req.body.trainer) return res.status(400).json({ message: 'Please, provide trainer details' });
        if (!req.body.users && !req.body.users.length) return res.status(400).json({ message: 'Please, provide users details' });
        if (req.body.users.length > 6) return res.status(400).json({ message: 'There are too many users in this session. maximum 6 users allowed' });
        if (req.body.users.every(isValidUser)) {
          req.body.users.forEach(user => {
            console.log(`User ${user.id} is valid.`);
            // Process the valid user data here
          });
        } else {
          return res.status(400).json({ message: 'Please validate whether the signatures for all users exist or not.' });
        }
        const checkSameTimeUserCount = await AttendanceServices.getAttendanceUserCount(req.body);
        if (req.body.users.length + checkSameTimeUserCount <= 6) {
          const addAttendanceDetail = await AttendanceServices.add(req.body);
          return res.status(200).json({ message: 'Attendance created Successfully', data: addAttendanceDetail });
        } else {
          return res.status(503).json({ message: 'The total number of users for the same time session has exceeded.' });
        }
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  static getAll = async (req, res) => {
    try {
      let attendance = await AttendanceServices.getAttendances();
      return res.status(200).json({ status: 200, message: 'Attendances Get Successfully', data: attendance });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static get = async (req, res) => {
    try {
      if (!req.query.attendanceId) return res.status(400).json({ message: 'Please, provide attendanceId' });
      let attendance = await AttendanceServices.getAttendance(req.query.attendanceId);
      return res.status(200).json({ status: 200, message: 'Attendance Get Successfully', data: attendance });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static getAllByTrainer = async (req, res) => {
    try {
      if (!req.query.trainer) return res.status(400).json({ message: 'Please, provide trainerId' });
      let attendance = await AttendanceServices.getAttendanceByTrainer(req.query.trainer);
      return res.status(200).json({ status: 200, message: 'Attendance Get Successfully', data: attendance });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static isValidToken = async (req, res) => {
    try {
      let checkGoogleToken = await AttendanceServices.checkGoogleToken();
      return res.status(200).json({ message: checkGoogleToken });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static googleAuthReq = async (req, res) => {
    try {
      let googleAuthReq = await AttendanceServices.googleAuthReq();
      return res.status(200).json({ url: googleAuthReq });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static redirectURL = async (req, res) => {
    try {
      let redirectURL = await AttendanceServices.redirectURL(req);
      return res.status(200).json({ message: redirectURL });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

}

module.exports = AttendanceController;
