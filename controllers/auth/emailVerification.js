'use strict';
import User from '../../models/user.js';
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
  // TODO: Host final bootcampr logo (email version) and replace URL
  const bootcamprLogoURL = 'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDN8RnpvM3p1T0hONnd8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60'
  const { email, firstName } = user;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const body = `
    <img src=${bootcamprLogoURL} />
    <br><br>Hey ${firstName},
    <br><br>Thank you for sigining up to be a beta Bootcampr!
    <br><br>We'll send you an email outlining the next steps when we're ready to start the beta test.
    <br><br>In the meantime, please <a href="${url}">confirm your email address</a> to log in.
    <br><br>After you log in, there will be a short onbording process.
    <br><br>You can also set up your profile. Your profile will only be seen by the members of your project team so they can get to know you.
    <br><br>If you are receiving this email in error, we're sorry for bothering you. You can ignore it.
    <br><br>We'll chat soon.
    <br><br>Let's go!
    <br><br>The Bootcampr Team
    <br><br><br> ** Plese note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.`

  const msg = {
    to: email,
    from: `${process.env.EMAIL_SENDER}`, // Change to your verified sender
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

export const verifyUniqueEmail = async (req,res) => {
  try {
    // check if user exists
    const email = req.params.email.toLowerCase()
    const user = await User.findOne({ email })
  
    // validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    const validFormat = emailRegex.test(email)
  
    if (!validFormat) {
      throw new Error('Please enter a valid email address.')
    } else if (user) {
      throw new Error('Email address already exists.')
    } else {
      res.status(200).json({message: 'Email is valid and unique.'})
    }
  } catch (error) {
    let statusCode = 400;

    if (error.message === 'Please enter a valid email address.') {
      statusCode = 422
    } else if (error.message === 'Email already exists.') {
      statusCode = 409
    }
    res.status(statusCode).send({ error: error.message })
  }
};