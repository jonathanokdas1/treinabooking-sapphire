const BookingServices = require('../Services/BookingServices');
const moment = require('moment');
class BookingController {

  static add = async (req, res) => {
    try {
      if (req.body) {
        if (!req.body.trainer) return res.status(400).json({ message: 'Please, provide trainer details' });
        if (!req.body.users && !req.body.users.length) return res.status(400).json({ message: 'Please, provide users details' });
        if (!req.body.startDate) return res.status(400).JSON({ message: 'Please provide startDate' });
        if (!req.body.endDate) return res.status(400).JSON({ message: 'Please provide endDate' });
        if (!moment(req.body.endDate).isAfter(req.body.startDate)) return res.status(400).JSON({ message: 'Incorrect endDate, End date must be greater than start date.' });

        if (req.body.users.length > 6) return res.status(400).json({ message: 'There are too many users in this session. maximum 6 users allowed' });
        const checkSameTimeUserCount = await BookingServices.getBookingUserCount(req.body);
        const checkBookingExists = await BookingServices.checkBookingExists(req.body);
        if (!checkBookingExists) {
          if (req.body.users.length + checkSameTimeUserCount <= 6) {
            const addbookingDetail = await BookingServices.add(req.body);
            return res.status(200).json({ message: 'booking created Successfully', data: addbookingDetail });
          } else {
            return res.status(503).json({ message: 'The total number of users for the same time session has exceeded.' });
          }
        } else {
          return res.status(503).json({ message: 'Already Session booked for requested time.' });
        }
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  static getAll = async (req, res) => {
    try {
      let bookings = await BookingServices.getAllBooking();
      return res.status(200).json({ status: 200, message: 'Get all booking successfully', data: bookings });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  static get = async (req, res) => {
    try {
      if (!req.query.bookingId) return res.status(400).json({ message: 'Please, provide bookingId' });
      let booking = await BookingServices.getBooking(req.query.bookingId);
      return res.status(200).json({ status: 200, message: 'Booking Get Successfully', data: booking });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static update = async (req, res) => {
    if (!req.body.bookingId) return res.status(400).json({ message: 'Please, provide bookingId.' });
    if (!req.body.trainer) return res.status(400).json({ message: 'Please, provide trainer details' });
    if (!req.body.users && !req.body.users.length) return res.status(400).json({ message: 'Please, provide users details' });
    if (!req.body.startDate) return res.status(400).JSON({ message: 'Please provide startDate' });
    if (!req.body.endDate) return res.status(400).JSON({ message: 'Please provide endDate' });
    if (!moment(req.body.endDate).isAfter(req.body.startDate)) return res.status(400).JSON({ message: 'Incorrect endDate, End date must be greater than start date.' });
    try {
      const { bookingId } = req.body;

      const booking = await BookingServices.findByPk(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      let updatedBooking = await BookingServices.update(req.body);
      return res.status(200).json({ status: 200, message: 'Booking updated Successfully', data: updatedBooking });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  static delete = async (req, res) => {
    try {
      const booking = await BookingServices.findByPk(req.query.bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      await BookingServices.delete(req.query);
      return res.status(200).json({ message: 'Booking delete successfully' });
    } catch (err) {
      return res.status(400).json({ message: err.message ? err.message : err });
    }
  }

  static isValidToken = async (req, res) => {
    try {
      let checkGoogleToken = await BookingServices.checkGoogleToken();
      return res.status(200).json({ message: checkGoogleToken });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static googleAuthReq = async (req, res) => {
    try {
      let googleAuthReq = await BookingServices.googleAuthReq();
      return res.status(200).json({ url: googleAuthReq });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static redirectURL = async (req, res) => {
    try {
      let redirectURL = await BookingServices.redirectURL(req);
      return res.status(200).json({ message: redirectURL });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }


}

module.exports = BookingController;
