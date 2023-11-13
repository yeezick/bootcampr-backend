import User from '../../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  newToken,
  emailTokenVerification,
  unverifiedEmailUser,
  sendUpdateEmailVerification,
  resetPasswordEmailVerification,
} from './emailVerification.js';

// should token key be generated here or how do we go about identifying the token to store in env?
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 11;
const TOKEN_KEY = process.env.NODE_ENV === 'production' ? process.env.TOKEN_KEY : 'themostamazingestkey';
const today = new Date();
const exp = new Date(today);
exp.setDate(today.getDate() + 30);

const defaultDayAvailability = {
  available: false,
  availability: [],
};

const availability = {
  SUN: defaultDayAvailability,
  MON: defaultDayAvailability,
  TUE: defaultDayAvailability,
  WED: defaultDayAvailability,
  THU: defaultDayAvailability,
  FRI: defaultDayAvailability,
  SAT: defaultDayAvailability,
};

export const signUp = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const isExistingUser = await duplicateEmail(email);
    if (isExistingUser) {
      return res.status(299).json({
        invalidCredentials: true,
        message: `An account with Email ${email} already exists. Please try a different email address to register, or Sign In to your existing Bootcampr account.`,
        existingAccount: true,
      });
    }
    const passwordDigest = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ availability, email, firstName, lastName, passwordDigest, onboarded: false });
    await user.save();

    const token = newToken(user, true);
    await emailTokenVerification(user, token);
    res.status(201).json({
      newUser: user._id,
      message: `We've sent a verification link to ${user.email}. Please click on the link that has been sent to your email to verify your account and continue the registration process. The link expires in 30 minutes.`,
      invalidCredentials: false,
      existingAccount: false,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

export const duplicateEmail = async (email) => {
  try {
    const foundUser = await User.findOne({ email: email });
    if (foundUser) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select('+passwordDigest');

    if (!user) {
      return res.status(299).json({
        invalidCredentials: true,
        message: `That Bootcampr account doesn't exist. Enter a different account or Sign Up to create a new one.`,
      });
    }

    if (!user.verified) {
      return await unverifiedEmailUser(user, res);
    }

    if (user) {
      let secureUser = Object.assign({}, user._doc, {
        passwordDigest: undefined,
      });
      if (await bcrypt.compare(password, user.passwordDigest)) {
        const payload = {
          userID: user._id,
          email: user.email,
          exp: parseInt(exp.getTime() / 1000),
        };
        const token = jwt.sign(payload, TOKEN_KEY);
        res.status(201).json({ user: secureUser, token });
      } else {
        res.status(299).json({
          invalidCredentials: true,
          message: "User ID and password don't match. Please try again.",
          tMsg: "User ID and password don't match. Please try again.",
        });
      }
    } else {
      res.status(299).json({
        invalidCredentials: true,
        message: 'No account exists with this email.',
        tMsg: 'No account exists with this email.',
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const bootcamprAuthToken = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(bootcamprAuthToken, TOKEN_KEY);
    if (payload) {
      res.json(payload);
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).send('Not authorized');
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const { userID } = req.params;

    const currentUser = await User.findById(userID).select('+passwordDigest');

    // For 'Change password' form containing 'Current password' and 'Enter new password' in Settings
    if (password && newPassword) {
      const passwordMatch = await bcrypt.compare(password, currentUser.passwordDigest);
      const passwordCompare = await bcrypt.compare(newPassword, currentUser.passwordDigest);

      if (!passwordMatch) {
        return res.status(401).json({
          status: false,
          message: 'Current password is incorrect.',
          friendlyMessage: 'Your password is incorrect.',
        });
      }

      if (passwordCompare) {
        return res.status(401).json({
          status: false,
          message: 'New password cannot be the same as your old password.',
          friendlyMessage: 'Sorry, your new password cannot be the same as your old password.',
        });
      }
    }

    // For 'Reset password' form containing only 'Enter new password' without 'Current password'
    if (!password && newPassword) {
      const passwordCompare = await bcrypt.compare(newPassword, currentUser.passwordDigest);

      if (passwordCompare) {
        return res.status(401).json({
          status: false,
          message: 'New password cannot be the same as your old password.',
          friendlyMessage: 'Sorry, your new password cannot be the same as your old password.',
        });
      }
    }

    const newPasswordDigest = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.findByIdAndUpdate(userID, { passwordDigest: newPasswordDigest }, { new: true });

    res.status(201).json({
      status: true,
      message: 'Password Updated',
      friendlyMessage: 'Your password has been successfully updated!',
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: 'Error updating password' });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { userId, newAvailability } = req.body;
    const user = await User.findByIdAndUpdate(userId, { availability: newAvailability }, { new: true });
    user.save();
    res.status(201).json({ status: true, message: 'Availability Updated', user, tMsg: 'Availability Updated' });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message, tMsg: 'Error updating availability' });
  }
};

export const confirmPassword = async (req, res) => {
  const { email, password } = req.body;
  // is it better to find the user by their email or id?
  if (email) {
    let user = await User.findOne({ email }).select('passwordDigest');
    if (await bcrypt.compare(password, user.passwordDigest)) {
      res.status(201).json({ passwordConfirmed: true });
    } else {
      res.status(401).json({ passwordConfirmed: false }); // status code: unacceptable lol
    }
  } else {
    res.status(401).json({ passwordConfirmed: false });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, userId } = req.body;
    const user = await User.findOne({ email });

    if (userId) {
      const loggedInUser = await User.findById(userId);

      // User enters an existing email in database, but does not match their logged in account
      if (user && email !== loggedInUser.email) {
        return res.status(401).json({
          status: false,
          message: `The email address ${email} is not associated with the user's account.`,
          friendlyMessage: 'Incorrect email. Please enter the email address associated with your account.',
        });
      }
    }

    // generate verification token
    const token = newToken(user, true);
    const userInfo = { user, email, token };

    await resetPasswordEmailVerification(userInfo);

    res.status(201).json({
      status: true,
      message: 'Reset password verification email successfully sent.',
      friendlyMessage: `We've sent a verification link to your email address. Please click on the link that has been sent to your email to reset your account password. The link expires in 30 minutes.`,
      invalidCredentials: false,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      status: false,
      message: error.message,
      friendlyMessage:
        'There was an issue sending your reset password verification email. Please try again or contact support.',
    });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { userId, oldEmail, newEmail } = req.body;
    const user = await User.findById(userId);

    // check that old email matches current users email
    if (user.email !== oldEmail) {
      return res.status(400).json({
        friendlyMessage: `This email address does not match the provided account.`,
      });
    }
    // check if email already exists elsewhere in database
    const isDuplicateEmail = await duplicateEmail(newEmail);

    if (isDuplicateEmail) {
      return res.status(401).json({
        friendlyMessage: `An account with email ${newEmail} already exists.`,
        existingAccount: true,
      });
    }

    // generate verification token
    const token = newToken(user, true);
    const userInfo = { user, newEmail, token };

    await sendUpdateEmailVerification(userInfo);

    res.status(201).json({
      friendlyMessage: `We've sent a verification link to ${newEmail}. Please click on the link that has been sent to your email to verify your updated email address. The link expires in 30 minutes.`,
      invalidCredentials: false,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      error: error.message,
      friendlyMessage: 'There was an issue re-sending your verification email. Please try again or contact support',
    });
    res.status(400).json({
      error: error.message,
      friendlyMessage: 'There was an issue re-sending your verification email. Please try again or contact support',
    });
  }
};

// Potentinal new User Controllers
//
// Assign Project - User
// Get User Availability
// Update User Availability
