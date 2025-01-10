import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import validator from 'validator';
//
import { User } from '../models/user.model.js';
//
import { generateTokenandSetCookie } from '../utils/generateTokenandSetCookie.js';
import {
  sendPasswordResetMail,
  sendPasswordUpdatedMail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../mailtrap/emails.js';
import { COOKIE_TOKEN, ResetPasswordUrl } from '../utils/constants.js';

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //Grab all the details from the req.body
    if (!email || !name || !password) {
      throw new Error('All fields are required');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Not a valid Email');
    }

    //Check if user already exists
    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    //Hash the password, before saving into DB
    const hashedPassword = await bcryptjs.hash(password, 10);
    //Generate verificationToken (6 digit verification code)
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    //Generate new user instance
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, //24hours
    });

    //Save the user in DB
    await user.save();

    //Generate JsonWebToken for created user and set the cookie
    generateTokenandSetCookie(res, user._id);

    //send the verification email
    await sendVerificationEmail(user.email, verificationToken);

    //Send successfully created user response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        ...user._doc,
        password: undefined,
        updatedAt: undefined,
        _v: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { verificationCode } = req.body;
  try {
    const user = await User.findOne({
      //verificationTokenExpiry - This checks that the verification token expiry data is in future of Date.now
      //This concludes that the token is not expired yet
      verificationToken: verificationCode,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Wrong verification code',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    //Save the user after updating the verification token and its expiry date
    await user.save();
    //Send the welcome mail
    await sendWelcomeEmail(user.email, user.name);

    res.status(201).json({
      success: true,
      message: `${user.name}'s email verified successfully`,
      data: {
        ...user._doc,
        password: undefined,
        updatedAt: undefined,
        _v: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error('All fields are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Credentials',
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Credentials',
      });
    }

    //Generate JsonWebToken for logged-in user and set the cookie
    generateTokenandSetCookie(res, user._id);

    //Update the last login and save the user
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.name} logged in successfully`,
      data: {
        ...user._doc,
        password: undefined,
        updatedAt: undefined,
        _v: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logOut = async (req, res) => {
  res.clearCookie(COOKIE_TOKEN);
  res.status(201).json({
    success: true,
    message: 'Logout Successful',
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    //Generate reset password token
    const resetPasswordToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordTokenExpiry = Date.now() + 1 * 60 * 60 * 1000; //1hour
    //Assign the generated info to the user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    //Save the updated user in the DB
    await user.save();
    //Send the password
    await sendPasswordResetMail(
      user.email,
      ResetPasswordUrl + resetPasswordToken
    );
    //Send the response
    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${user.email}`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token',
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    await sendPasswordUpdatedMail(user.email);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {}
};

export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      message: 'User is authenticated',
      data: {
        ...user._doc,
        password: undefined,
        updatedAt: undefined,
        _v: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
