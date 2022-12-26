import User from '../models/user.js';
import bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';
import Project from '../models/project.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Token from '../models/token.js';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 11;

// should token key be generated here or how do we go about identifying the token to store in env?
const TOKEN_KEY = process.env.NODE_ENV === 'production' ? process.env.TOKEN_KEY : 'themostamazingestkey';

const today = new Date();
const exp = new Date(today);
exp.setDate(today.getDate() + 30);

export const getAllUsers = async (req, res) => {
  try {
    const allUser = await User.find({});
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
    res.status(200).send(user);
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
export const newToken = async (user) => {
  const payload = {
    userId: user._id,
    token: crypto.randomUUID(),
    exp: parseInt(exp.getTime() / 1000),
  };
  console.log('USER', user);

  const token = await Token.create(payload);
  console.log(token, 'eror here?');
  const tokenjwt = jwt.sign({ userID: user._id, email: user.email, exp: parseInt(exp.getTime() / 1000) }, TOKEN_KEY);
  return tokenjwt;
};

export const signUp = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const passwordDigest = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ email, firstName, lastName, passwordDigest });
    await user.save();

    const token = await newToken(user);

    let secureUser = Object.assign({}, user._doc, {
      passwordDigest: undefined,
    });

    await emailTokenVerification(user, email, firstName, lastName, token);

    res.status(201).json({ user: secureUser, token });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

const emailTokenVerification = async (user, email, firstName, lastName, token) => {
  const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token}`;
  sendSignUpEmail(email, url, firstName, lastName);
};

const sendSignUpEmail = (email, url, firstName, lastName, verified = false) => {
  console.log(email, url, firstName, lastName, verified);
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email, // Change to your recipient
    from: `${process.env.EMAIL_SENDER}`, // Change to your verified sender
    subject: 'Verify your email for Bootcampr',
    text: `Welcome to Bootcampr, ${firstName} ${lastName}`,

    html: verified
      ? `pls verified before loging in :
    <br><br>${url}`
      : `Click this link to confirm your email address and complete setup for your candidate account:
    <br><br>${url}`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log('Verification email sent successfully');
    })
    .catch((error) => {
      console.log('Email not sent');
      console.error(error);
    });
};

export const verifyEmailLink = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).send({ msg: 'Invalid link' });
    }
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).send({ msg: 'Invalid link' });
    }

    await User.findByIdAndUpdate({ _id: user._id }, { verified: true }, { new: true });
    await token.remove();

    res.status(200).send({ msg: 'Email verified successfully', token: token, user: user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: false, message: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select('+passwordDigest');
    // if (user.verified === false) {
    //   return await unverifiedEmailUser(user, res);
    // }
    console.log('1');
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
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

const unverifiedEmailUser = async (user, res) => {
  try {
    console.log('2');
    const newtoken = await newToken(user);
    // let newEmailToken = await Token.findOne({ userId: user._id });
    let newEmailToken = await Token.find({});
    console.log(newEmailToken);

    const url = `${process.env.BASE_URL}/${user._id}/verify/${newEmailToken.token}`;
    sendSignUpEmail(user.email, url, user.firstName, user.lastName, true);
    return res.status(200).json({ msg: 'An Email was sent to your account. Please verify.' });
  } catch (error) {
    res.status(400).send({ msg: 'An Email was sent to your account. Please verify i was here.' });
  }
};

export const verify = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(token, TOKEN_KEY);
    if (payload) {
      res.json(payload);
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).send('Not authorized');
  }
};

// fbc176462c21d9d8eaa9cb0a6937ca17fc151aba8c12998303a066c256a2650c

export const confirmPassword = async (req, res) => {
  const { email, password } = req.body;
  // is it better to find the user by their email or id?
  if (email) {
    let user = await User.findOne({ email }).select('passwordDigest');
    if (await bcrypt.compare(password, user.passwordDigest)) {
      res.status(201).json({ passwordConfirmed: true });
    } else {
      res.status(401).json({ passwordConfirmed: false }); // status code: unnacceptable lol
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
    const token = jwt.sign(payload, TOKEN_KEY);
    res.status(201).json({ status: true, message: 'Password Updated', user, token });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};
