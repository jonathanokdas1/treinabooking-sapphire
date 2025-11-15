const jwt = require('jsonwebtoken');
const UserServices = require('../Services/UserServices');

const JWT_SECRET = 'dd5f3089-40c3-403d-af14-d0c228b05cb4';
const JWT_EXPIRATION = '24h';

class AuthController {

  static login = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email) return res.status(400).json({ message: 'Email is required' });
      if (!password) return res.status(400).json({ message: 'Password is required' });

      const user = await UserServices.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.delete) {
        return res.status(401).json({ message: 'User account is inactive' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          type: user.type 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      const userData = {
        id: user.id,
        role: user.type,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        username: user.email,
        avatar: null
      };

      return res.status(200).json({
        accessToken: token,
        userData: userData
      });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static me = async (req, res) => {
    try {
      const user = req.user;

      const userData = {
        id: user.id,
        role: user.type,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        username: user.email,
        avatar: null
      };

      return res.status(200).json({ userData });

    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

}

module.exports = AuthController;