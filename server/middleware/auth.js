const jwt = require('jsonwebtoken');
const UserServices = require('../Services/UserServices');

const JWT_SECRET = 'dd5f3089-40c3-403d-af14-d0c228b05cb4';

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserServices.getUser(decoded.id);

    if (!user || user.delete) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};