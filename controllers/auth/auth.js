import User from '../../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { newToken, emailTokenVerification, unverifiedEmailUser } from './emailVerification.js';

// should token key be generated here or how do we go about identifying the token to store in env?
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 11;
const TOKEN_KEY = process.env.NODE_ENV === 'production' ? process.env.TOKEN_KEY : 'themostamazingestkey';
const today = new Date();
const exp = new Date(today);
exp.setDate(today.getDate() + 30);

export const getAllUsers = async (req, res) => {
  try {
    const allUser = await User.find({}).populate(['memberOfProjects']);
    if (allUser) {
      res.status(200).json(allUser);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ message: 'All User not found.', error: error.message });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate(['memberOfProjects']);
    if (user) {
      return res.status(200).json(user);
    }
  } catch (error) {
    console.error(error.message);
    return res.status(404).json({ message: 'User not found.', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // deleteImageFromS3Bucket(id); // Koffi's fix
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      return res.status(200).send({ deletionStatus: true, message: 'User deleted.' });
    }
    throw new Error('User not found.');
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ deletionStatus: false, error: error.message });
  }
};

export const addPortfolioProject = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { $push: { portfolioProjects: req.body } }, { new: true });
    // i believe this can be handled better by throwing an error rather than responding with a 404
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ message: 'User not found.', error: error.message });
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const imageWasUpdated = req.body.imageWasUpdated;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (imageWasUpdated) {
      const updatedUserImg = await updatingImage(id);
      return res.status(200).send(updatedUserImg);
    }
    res.status(200).send(user);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ error: error.message });
  }
};

// Auth

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
    const user = new User({ email, firstName, lastName, passwordDigest, onboarded: false });
    await user.save();

    const token = newToken(user, true);
    await emailTokenVerification(user, token);
    res.status(201).json({
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
        res.status(299).json({ invalidCredentials: true, message: 'Invalid email or password.' });
      }
    } else {
      res.status(299).json({ invalidCredentials: true, message: 'No account exists with this email.' });
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

export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { userID } = req.params;
    const newPasswordDigest = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const user = await User.findByIdAndUpdate(userID, { passwordDigest: newPasswordDigest }, { new: true });
    const payload = {
      userID: user._id,
      email: user.email,
      exp: parseInt(exp.getTime() / 1000),
    };
    const bootcamprAuthToken = jwt.sign(payload, TOKEN_KEY);
    res.status(201).json({ status: true, message: 'Password Updated', user, bootcamprAuthToken });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

// Potentinal new User Controllers
//
// Assign Project - User
// Get User Availability
// Update User Availability
