const BookingRepositories = require('../Repositories/BookingRepositories');

class BookingServices {

    static add = async (booking) => {
        return await BookingRepositories.create(booking);
    }

    static getAllBooking = async () => {
        return await BookingRepositories.getAll();
    }

    static getBooking = async (bookingId) => {
        return await BookingRepositories.get(bookingId);
    }

    static findByPk = async (bookingId) => {
        return await BookingRepositories.findByPk(bookingId);
    }

    static checkGoogleToken = async () => {
        return await BookingRepositories.checkGoogleToken();
    }

    static googleAuthReq = async () => {
        return await BookingRepositories.googleAuthReq();
    }

    static redirectURL = async (req) => {
        return await BookingRepositories.redirectURL(req);
    }

    static getBookingUserCount = async (data) => {
        return await BookingRepositories.getBookingUserCount(data);
    }

    static update = async (update) => {
        return await BookingRepositories.update(update);
    }

    static delete = async (data) => {
        return await BookingRepositories.delete(data);
    }

    static checkBookingExists = async (data) => {
        return await BookingRepositories.checkBookingExists(data);
    }

}

module.exports = BookingServices;