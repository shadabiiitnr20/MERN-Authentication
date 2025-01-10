import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyToken = async (req, res, next) => {
  const { authToken } = req.cookies;
  try {
    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: no token provided, please Login again',
      });
    }
    const decodedObj = await jwt.verify(authToken, process.env.JWT_SECRET);
    const { userId } = decodedObj;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
