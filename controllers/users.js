import User from '../models/user.js';
import bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 11;

// should token key be generated here or how do we go about identifying the token to store in env?
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
    const user = await User.findById(id);
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
    deleteImageFromS3Bucket(id);
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
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    const updatedUserImg = await updatingImage(id);
    res.status(200).send(updatedUserImg);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ error: error.message });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.json({
        message: 'An account with this email address already exists.',
      });
    }
    return res.status(200).json({ message: false });
  } catch (error) {
    console.error({ err: error.message });
    res.status(500).json({ error: error.message });
  }
};

// Auth

export const signUp = async (req, res) => {
  try {
    const { email, firstName, lastName, password, profilePicture } = req.body;

    const passwordDigest = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ email, firstName, lastName, passwordDigest, profilePicture });
    await user.save();
    const payload = {
      userID: user._id,
      email: user.email,
      exp: parseInt(exp.getTime() / 1000),
    };
    const bootcamprAuthToken = jwt.sign(payload, TOKEN_KEY);
    let secureUser = Object.assign({}, user._doc, {
      passwordDigest: undefined,
    });

    res.status(201).json({ user: secureUser, bootcamprAuthToken });
    sendSignUpEmail(email, firstName, lastName);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

const sendSignUpEmail = (email, firstName, lastName) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email, // Change to your recipient
    from: 'koffiarielhessou@gmail.com', // Change to your verified sender
    subject: 'Bootcampr Signup',
    text: `Welcome to Bootcampr ${(firstName, lastName)}`,
    html: `<strong> Bootcampr is an awesome project that allows user to add experience </strong>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.error(error);
    });
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select('+passwordDigest');
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
        const bootcamprAuthToken = jwt.sign(payload, TOKEN_KEY);

        res.status(201).json({ user: secureUser, bootcamprAuthToken });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
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
