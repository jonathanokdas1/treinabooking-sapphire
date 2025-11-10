const UserServices = require('../Services/UserServices');

class UserController {

  static add = async (req, res) => {
    try {
      if (!req.body.firstName) return res.status(400).json({ message: 'Please, provide firstName' });
      if (!req.body.lastName) return res.status(400).json({ message: 'Please, provide lastName' });
      if (!req.body.email) return res.status(400).json({ message: 'Please, provide email' });
      if (!req.body.type) return res.status(400).json({ message: 'Please, provide type' });
      if (!req.body.mobile) return res.status(400).json({ message: 'Please, provide mobile' });
      if (!req.body.taxNumber) return res.status(400).json({ message: 'Please, provide taxNumber' });
      if (req.body) {
        let checkUser = await UserServices.getUserByEmail(req.body.email);
        if (checkUser) return res.status(208).json({ status: 208, message: 'Request user\'s email address already exists.' });

        const addUserDetail = await UserServices.addUser(req.body);
        return res.status(200).json({ message: 'User created Successfully', data: addUserDetail });
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static getAll = async (req, res) => {
    try {
      let user = await UserServices.getUsers(req.query);
      return res.status(200).json({ status: 200, message: 'Users Get Successfully', data: user });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static get = async (req, res) => {
    try {
      if (!req.query.userId) return res.status(400).json({ message: 'Please, provide userId' });
      let user = await UserServices.getUser(req.query.userId);
      return res.status(200).json({ status: 200, message: 'User Get Successfully', data: user });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  static getByType = async (req, res) => {
    try {
      if (!req.query.type) return res.status(400).json({ message: 'Please, provide user type' });
      let user = await UserServices.getUserByType(req.query.type);
      return res.status(200).json({ status: 200, message: 'User Get Successfully', data: user });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static update = async (req, res) => {
    try {
      if (!req.body.userId) return res.status(400).json({ message: 'Please, provide userId' });
      if (!req.body.data.firstName) return res.status(400).json({ message: 'Please, provide firstName' });
      if (!req.body.data.lastName) return res.status(400).json({ message: 'Please, provide lastName' });
      // if (!req.body.data.email) return res.status(400).json({ message: 'Please, provide email' });
      // if (!req.body.data.taxNumber) return res.status(400).json({ message: 'Please, provide email' });
      if (!req.body.data.type) return res.status(400).json({ message: 'Please, provide type' });
      if (!req.body.data.mobile) return res.status(400).json({ message: 'Please, provide mobile' });
      let user = await UserServices.getUser(req.body.userId);
      if (user) {
        let updatedUser = await UserServices.update(req.body.userId, req.body.data);
        return res.status(200).json({ status: 200, message: 'User Get Successfully', data: updatedUser });
      } else {
        return res.status(400).json({ message: 'Requested user was not exists.' });
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static delete = async (req, res) => {
    try {
      if (!req.query.userId) return res.status(400).json({ message: 'Please, provide userId' });
      let user = await UserServices.getUser(req.query.userId);
      if (user) {
        let deleteUser = await UserServices.update(req.query.userId, {delete: true});
        return res.status(200).json({ status: 200, message: 'User get deleted Successfully' });
      } else {
        return res.status(400).json({ message: 'Requested user was not exists or deleted.' });
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }
}

module.exports = UserController;
