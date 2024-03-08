'use strict';
import User from '../../models/user.js';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { scheduleJob } from 'node-schedule';

const TOKEN_KEY = process.env.NODE_ENV === 'production' ? process.env.TOKEN_KEY : 'themostamazingestkey';
const today = new Date();
const exp = new Date(today);
exp.setDate(today.getDate() + 30);

export const newToken = (user, temp = false) => {
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
    from: `${process.env.SENDGRID_EMAIL}` || 'koffiarielhessou@gmail.com', // Change to your verified sender
    subject: 'Welcome to Bootcampr!',
    html: body,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log('Verification email sent successfully');
    })
    .catch((error) => {
      console.log('Verification email not sent');
      console.error(error);
    });
};

export const sendUpdateEmailVerification = ({ user, newEmail, token }) => {
  const encodedEmail = btoa(newEmail);
  const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token}?${encodedEmail}`;
  const bootcamprLogoURL = 'https://tinyurl.com/2s47km8b';

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const emailBody = `
    <table style="background-color: #F2F4FF; width: 100%; max-width: 910px; min-height: 335px; margin: 0 auto; border-radius: 4px; padding: 25px 25px 125px 25px;">
      <tr>
        <td style="text-align: center;">
          <img src=${bootcamprLogoURL} alt="logo" style="height: 42px; width: auto; margin: 0 auto; margin-bottom: 25px;" draggable="false" />
          <table style="background-color: #FFFFFF; width: 100%; max-width: 560px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="font-size: 16px;">
                <p style="color: black; margin: 0; margin: 10px 0; text-align: center;">Please verify your updated email address</p>
                <p style="color: black; margin: 0; margin-bottom: 30px; text-align: center;">You'll be asked to log in again.</p>
                <a href=${url} style="background-color: #FFA726; border-radius: 4px; color: black; font-size: 14px; padding: 8px 20px; text-decoration: none; text-align: center; margin-bottom: 25px;">Verify updated email address</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
`;

  const msg = {
    to: newEmail,
    from: `${process.env.SENDGRID_EMAIL}` || 'koffiarielhessou@gmail.com', // Change to your verified sender
    subject: "It's Bootcampr!",
    html: emailBody,
  };

  try {
    sgMail
      .send(msg)
      .then(() => {
        console.log('Verification email sent successfully');
      })
      .catch((error) => {
        console.log('Email not sent');
        console.error(error);
        throw error;
      });
  } catch (err) {
    console.error(err);
  }
};

export const verifyEmailLink = async (req, res) => {
  try {
    const expiredToken = await verifyValidToken(req, req.params.token);
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

export const verifyValidToken = async (req, tokenjwt) => {
  const { emailToken } = req.params;

  try {
    const isExpired = jwt.decode(emailToken || tokenjwt);

    if (isExpired.exp * 1000 < Date.now()) {
      return true;
    }
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
    const token = newToken(user, true);

    if (req._parsedUrl.query?.length > 0) {
      // decode email from query params
      const newEmail = atob(req._parsedUrl.query);
      await sendUpdateEmailVerification(user, newEmail, token);
      res.status(200).json({ friendlyMessage: 'A new verification link has been sent to your updated email address.' });
    } else {
      emailTokenVerification(user, token);
      res
        .status(200)
        .json({ friendlyMessage: `Hi ${user.firstName}, a new link has been sent to your email. Please verify.` });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({
      error: error,
      friendlyMessage: 'There was an error sending a new verification email. Please try again or contact support.',
    });
  }
};

export const verifyUniqueEmail = async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const validFormat = emailRegex.test(email);

    if (!validFormat) {
      throw new Error('Invalid email.');
    } else {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('Email address already exists.');
      } else {
        res.status(200).json({ message: 'Email is valid and unique.' });
      }
    }
  } catch (error) {
    let statusCode = 400;

    if (error.message === 'Invalid email.') {
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
        const users = await User.find().select('project unreadMessages email firstName');

        if (users.length === 0) {
          return res.status(204).json({ message: 'No users found in database' });
        }

        users.forEach((user) => {
          const { _id: userId, project, firstName, email, unreadMessages } = user;
          const unreadAmount = unreadMessages.size; // Number of unread conversations

          // New token created to auto login user
          const payload = {
            userID: userId,
            email,
          };
          const expiration = {
            expiresIn: 43200, // Expires in 12 hours
          };
          const token = jwt.sign(payload, TOKEN_KEY, expiration);

          if (unreadAmount > 0) {
            sendUnreadMessagesEmail(project, userId, email, firstName, unreadAmount, token);
          }
        });
        res.status(200).json({ message: `Email notification job completed successfully` });
      } catch (error) {
        console.error(error.message);
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

// TODO: Following logic to verify user and determine routing should be done at a layout/auth layer on the frontend, not the responsibility of the rendered component
// BC-619
export const sendUnreadMessagesEmail = (project, userId, email, firstName, unreadAmount, token) => {
  const loginUrl = `http://localhost:3000/project/${project}?user=${userId}&unread=${token}`;
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

export const sendChatInvite = async (user, chatRoomId) => {
  const url = `${process.env.BASE_URL}/notifications/${user._id}?type=chat&chatRoomId=${chatRoomId}`;
  sendChatInviteEmail(user, url);
};
export const sendChatInviteEmail = (user, url) => {
  const { firstName, email } = user;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const bootcamprLogoURL = 'https://tinyurl.com/2s47km8b';
  const body = `
    <table style="background-color: #F2F4FF; width: 100%; max-width: 910px; min-height: 335px; margin: 0 auto; border-radius: 4px; padding: 25px 25px 125px 25px;">
      <tr>
        <td style="text-align: center;">
          <img src=${bootcamprLogoURL} alt="logo" style="height: 42px; width: auto; margin: 0 auto; margin-bottom: 25px;" draggable="false" />
          <table style="background-color: #FFFFFF; width: 100%; max-width: 560px; margin: 0 auto; padding: 20px;">
            <tr>
              <td style="font-size: 16px;">
                <p style="color: black; margin: 0; margin-bottom: 32px; text-align: left;">Hi ${firstName}!</p>
                <p style="color: black; margin: 0; text-align: left; font-weight: bold;">You have been invited to a new chat!</p>
                <p style="color: black; margin: 0; margin-top: 8px; margin-bottom:64px; text-align: left;">Be the first to get the conversation going!</p>
                <a href=${url} style="background-color: #FFA726; border-radius: 4px; color: black; font-size: 11px; font-weight: 500; padding: 8px 20px; text-decoration: none; align-self: center;">Open chat</a>
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
    subject: 'You have been invited to a new chat!',
    html: body,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Invited to a new chat email notification sent to ${email} successfully`);
    })
    .catch((error) => {
      console.log('Invitation email error');
      console.error(error.response.body.errors);
      console.error(error);
    });
};
export const resetPasswordEmailVerification = ({ user, token }) => {
  const resetPasswordUrl = `${process.env.BASE_URL}/users/${user._id}/reset-password/${token}`;
  const loginUrl = `${process.env.BASE_URL}/sign-in`;
  const bootcamprLogoURL = 'https://tinyurl.com/2s47km8b';

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const emailBody = `
      <table style="background-color: #F2F4FF; width: 100%; max-width: 910px; min-height: 335px; margin: 0 auto; border-radius: 4px; padding: 25px 25px 125px 25px;">
        <tr>
          <td style="text-align: center;">
            <img src=${bootcamprLogoURL} alt="logo" style="height: 42px; width: auto; margin: 0 auto; margin-bottom: 25px;" draggable="false" />
            <table style="background-color: #FFFFFF; width: 100%; max-width: 560px; margin: 0 auto; padding: 20px;">
              <tr>
                <td style="font-size: 16px;">
                  <p style="color: black; margin: 0; margin: 10px 0; text-align: center;">if you asked to reset your password by mistake, disregard this email and <a href=${loginUrl}>log in</a>.</p>
                  <a href=${resetPasswordUrl} style="background-color: #FFA726; border-radius: 4px; color: black; font-size: 14px; padding: 8px 20px; text-decoration: none; text-align: center; margin-bottom: 25px;">Reset My Password</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
  `;

  const msg = {
    to: user.email,
    from: `${process.env.SENDGRID_EMAIL}` || 'koffiarielhessou@gmail.com', // Change to your verified sender
    subject: 'Bootcampr Password Reset Verification',
    html: emailBody,
  };

  try {
    sgMail
      .send(msg)
      .then(() => {
        console.log('Password reset verification sent successfully');
      })
      .catch((error) => {
        console.log('Password reset verification could not be sent');
        console.error(error);
        throw error;
      });
  } catch (err) {
    console.error(err);
  }
};
