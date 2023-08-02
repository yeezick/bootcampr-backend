'use strict';
import User from '../../models/user.js';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { scheduleJob } from 'node-schedule';
import { getAllChatThreads } from '../user/users.js';

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
  // TODO: Host final bootcampr logo (email version) and replace URL
  const bootcamprLogoURL = 'https://tinyurl.com/2s47km8b';
  const { email, firstName } = user;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const body = `<table style="background-color: #F2F4FF; width: 100%; max-width: 910px; min-height: 335px; margin: 0 auto; border-radius: 4px; padding: 25px 25px 125px 25px;">
      <tr>
        <td style="text-align: center;">
          <img src=${bootcamprLogoURL} alt="logo" style="height: 42px; width: auto; margin: 0 auto; margin-bottom: 25px;" draggable="false" />
          <table style="background-color: #FFFFFF; width: 100%; max-width: 560px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="font-size: 15px;">
                <p style="color: black; margin: 0; margin-bottom: 20px; text-align: left;">Hi ${firstName}!</p>
                <p style="color: black; margin: 0; margin-bottom: 2px; text-align: left;">You've signed up to be a beta Bootcampr!</p>
                <p style="color: black; margin: 0; margin-bottom: 40px; text-align: left;">Confirm your email address to log in and start a short onboarding process.</p>
                <a href=${url} style="background-color: #FFA726; border-radius: 4px; color: black; font-size: 11px; font-weight: 500; padding: 8px 20px; text-decoration: none; text-align: center;">Confirm your email address</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  const msg = {
    to: email,
    from: `${process.env.SENDGRID_EMAIL}`, // Change to your verified sender
    subject: 'Welcome to Bootcampr!',
    html: body,
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
    res.status(200).send({
      msg: `Hi, ${user.firstName}! Your email has been successfully verified. Please Sign In to finish setting up your account.`,
      user: user,
      bootcamprNewToken: userToken,
    });
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
        'Your email is not verified. A new verification link was sent to your email. Please click on the link that has been sent to verify your account. The link expires in 30 minutes.',
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

export const verifyUniqueEmail = async (req, res) => {
  try {
    // check if user exists
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email });

    // validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const validFormat = emailRegex.test(email);

    if (!validFormat) {
      throw new Error('Please enter a valid email address.');
    } else if (user) {
      throw new Error('Email address already exists.');
    } else {
      res.status(200).json({ message: 'Email is valid and unique.' });
    }
  } catch (error) {
    let statusCode = 400;

    if (error.message === 'Please enter a valid email address.') {
      statusCode = 422;
    } else if (error.message === 'Email already exists.') {
      statusCode = 409;
    }
    res.status(statusCode).send({ error: error.message });
  }
};

export const newMessageNotificationEmail = async (req, res) => {
  try {
    const frequency = '0 0 12 * * ?'; // Every day at 12:00PM

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    scheduleJob(frequency, async () => {
      try {
        const users = await User.find().select('unreadMessages email firstName');

        if (users.length === 0) {
          return res.status(204).json({ message: 'No users found in database' });
        }

        users.forEach((user) => {
          const { firstName, email, unreadMessages } = user;
          const unreadAmount = unreadMessages.size; // Number of unread conversations

          if (unreadAmount > 0) {
            sendUnreadMessagesEmail(email, firstName, unreadAmount);
          }
        });
      } catch (error) {
        console.error(error.message);
      }
    });
    res.status(200).json({ message: `Email notification job completed successfully` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const sendUnreadMessagesEmail = (email, firstName, unreadAmount) => {
  const loginUrl = 'http://localhost:3000/sign-in';
  const bootcamprLogoURL = 'https://tinyurl.com/2s47km8b';

  const body = `
    <table style="background-color: #F2F4FF; width: 100%; max-width: 910px; min-height: 335px; margin: 0 auto; border-radius: 4px; padding: 25px 25px 125px 25px;">
      <tr>
        <td style="text-align: center;">
          <img src=${bootcamprLogoURL} alt="logo" style="height: 42px; width: auto; margin: 0 auto; margin-bottom: 25px;" draggable="false" />
          <table style="background-color: #FFFFFF; width: 100%; max-width: 560px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="font-size: 15px;">
                <p style="color: black; margin: 0; margin-bottom: 20px; text-align: left;">Hi ${firstName}!</p>
                <p style="color: black; margin: 0; margin-bottom: 2px; text-align: left;">You have ${unreadAmount} new message${
    unreadAmount > 1 ? 's' : ''
  }!</p>
                <p style="color: black; margin: 0; margin-bottom: 40px; text-align: left;">Your teammates value your input and would like to hear from you.</p>
                <a href=${loginUrl} style="background-color: #FFA726; border-radius: 4px; color: black; font-size: 11px; font-weight: 500; padding: 8px 20px; text-decoration: none; text-align: center;">View messages</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
`;

  const msg = {
    to: email,
    from: `${process.env.SENDGRID_EMAIL}`,
    subject: 'You have unread messages!',
    html: body,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Unread messages email notification sent to ${email} successfully`);
    })
    .catch((error) => {
      console.log('Unread messages email not sent');
      console.error(error);
    });
};
