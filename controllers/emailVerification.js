'use strict';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

const TOKEN_KEY = process.env.NODE_ENV === 'production' ? process.env.TOKEN_KEY : 'themostamazingestkey';

export const newToken = (user, temp = false) => {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 30);

  const tokenjwt = jwt.sign({ userID: user._id, email: user.email }, TOKEN_KEY, {
    expiresIn: temp ? 1800 : parseInt(exp.getTime() / 1000),
  }); // temp expires in 30 minutes
  return tokenjwt;
};

export const emailTokenVerification = async (user, token) => {
  const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token}`;
  sendSignUpEmail(user, url);
};

export const sendSignUpEmail = (user, url, verified = false) => {
  const { email, firstName, lastName } = user;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email, // Change to your recipient
    from: `${process.env.EMAIL_SENDER}`, // Change to your verified sender
    subject: 'Verify your email for Bootcampr',
    text: `Welcome to Bootcampr, ${firstName} ${lastName}`,

    html: verified
      ? `Your account is not verified. Please click this link to verify your account before logging in:
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
    const expiredToken = await verifyValidToken(req.params.token, res);
    if (expiredToken) {
      return res.status(299).json({ msg: 'This url is expired. Please request a new link.', isExpired: true });
    }
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, { verified: true }, { new: true });

    if (!user) {
      return res.status(400).send({ msg: 'Invalid link' });
    }
    const userToken = newToken(user);
    res.status(200).send({ msg: 'Email verified successfully', user: user, bootCamprNewToken: userToken });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: false, message: error.message });
  }
};

export const verifyValidToken = async (tokenjwt, res) => {
  try {
    const isExpired = jwt.decode(tokenjwt);

    if (isExpired.exp * 1000 < Date.now()) return true;
    return false;
  } catch (error) {
    res.status(400).send({ error: error });
  }
};

export const unverifiedEmailUser = async (user, res) => {
  try {
    const newEmailToken = newToken(user, true);
    const url = `${process.env.BASE_URL}/users/${user._id}/verify/${newEmailToken}`;
    sendSignUpEmail(user, url, true);
    return res.status(299).json({
      invalidCredentials: true,
      message:
        'Your email is not verified. A verification link was sent to your email. Please click on the link that has been sent to verify your account. The link expires in 30 minutes.',
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ error: error });
  }
};

export const resendNewEmailLink = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    const tempToken = newToken(user, true);
    emailTokenVerification(user, tempToken);
    res.status(200).json({ message: `Hi ${user.firstName}, a new link has been sent to your email. Please verify.` });
  } catch (error) {
    console.log(error.message);
    res.status(400).send({ error: error });
  }
};
