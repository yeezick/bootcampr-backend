import supertest from 'supertest';
import app from '../../server';
import User from '../../models/user';
import bcrypt from 'bcrypt';
import mongoose, { isValidObjectId } from 'mongoose';
import { newToken } from '../../controllers/auth/emailVerification';

const { ObjectId } = mongoose.Types;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 11;

const userData = {
  firstName: 'Hector',
  lastName: 'Ilarraza',
  email: 'hector@example.com',
  password: 'dummy_password',
};

describe('Auth Routes', () => {
  describe('POST /sign-up', () => {
    beforeEach(async () => {
      await User.deleteMany({});
    });

    it('should return 201 and confirm user creation and email verification sent', async () => {
      try {
        const res = await supertest(app).post('/sign-up').send(userData);
        expect(res.status).toBe(201);
        expect(isValidObjectId(res.body.newUser)).toBe(true);
        expect(res.body).toEqual(
          expect.objectContaining({
            message: `We've sent a verification link to ${userData.email}. Please click on the link that has been sent to your email to verify your account and continue the registration process. The link expires in 30 minutes.`,
            invalidCredentials: false,
            existingAccount: false,
          }),
        );
      } catch (err) {
        console.error(err.message);
        throw err;
      }
    });

    it('should return 409 and confirm user email already exists', async () => {
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: true,
      });
      try {
        const res = await supertest(app).post('/sign-up').send(userData);
        expect(res.status).toBe(409);
        expect(res.body).toEqual({
          message: `An account with Email ${userData.email} already exists. Please try a different email address to register, or Sign In to your existing Bootcampr account.`,
          invalidCredentials: true,
          existingAccount: true,
        });
      } catch (err) {
        console.error(err.message);
        throw err;
      }
    });

    it('should return 400 for missing fields', async () => {
      const requiredFields = ['firstName', 'lastName', 'email', 'password'];
      await Promise.all(
        requiredFields.map(async (field) => {
          const cloneUserData = { ...userData };
          delete cloneUserData[field];
          const res = await supertest(app).post('/sign-up').send(cloneUserData);
          expect(res.status).toBe(400);
          expect(res.body).toEqual({
            message: `Missing required fields: ${field}`,
            invalidCredentials: true,
            existingAccount: false,
          });
        }),
      );
    });

    // TODO: Potential Additional Tests for Sign Up:
    // Validate password Strength or Length?
    // Combination of Invalid Fields?
    // Invalid Email Address? Should that be its own test file emailVerification.js?
    // look into Promise.all
    // Dynamic email for testing
  });

  describe('POST /sign-in', () => {
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: true,
      });
    });

    it('should sign in an existing user and return a token', async () => {
      const res = await supertest(app).post('/sign-in').send({
        email: userData.email,
        password: userData.password,
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should return an error for account does not exist', async () => {
      const nonExistentEmail = `nonexistent${Date.now()}@example.com`;
      const res = await supertest(app).post('/sign-in').send({
        email: nonExistentEmail,
        password: 'nonexistentpassword',
      });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        invalidCredentials: true,
        message: `That Bootcampr account doesn't exist. Enter a different account or Sign Up to create a new one.`,
      });
    });

    it('should return an error for invalid credentials', async () => {
      const res = await supertest(app).post('/sign-in').send({
        email: userData.email,
        password: 'wrong_password',
      });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        invalidCredentials: true,
        message: "User ID and password don't match. Please try again.",
        tMsg: "User ID and password don't match. Please try again.",
      });
    });
  });

  describe('GET /verify', () => {
    let validToken;

    beforeAll(async () => {
      const res = await supertest(app).post('/sign-in').send({
        email: userData.email,
        password: userData.password,
      });
      validToken = res.body.token;
    });

    it('should verify a user with a valid token', async () => {
      const res = await supertest(app).get('/verify').set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('userID');
      expect(res.body).toHaveProperty('email');
    });

    it('should return an error for an invalid token', async () => {
      const res = await supertest(app).get('/verify');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Not authorized' });
    });

    it('should return an error if no token is provided', async () => {
      const res = await supertest(app).get('/verify');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Not authorized' });
    });
  });

  describe('GET /verify-email/:email', () => {
    it('should confirm the email is valid and unique', async () => {
      const uniqueEmail = `unique${Date.now()}@example.com`;
      const res = await supertest(app).get(`/verify-email/${uniqueEmail}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Email is valid and unique.' });
    });

    it('should return an error for invalid email format', async () => {
      const invalidEmail = 'invalid-email';
      const res = await supertest(app).get(`/verify-email/${invalidEmail}`);
      expect(res.status).toBe(422);
      expect(res.body).toEqual({ error: 'Invalid email.' });
    });

    it('should return an error if the email address already exists', async () => {
      const existingEmail = userData.email;
      const res = await supertest(app).get(`/verify-email/${existingEmail}`);
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'Email address already exists.' });
    });

    // TODO: Potential Additional Tests for verify-email/:email:
    // Test for case sensitivity?
    // Test for trailing spaces?
    // Test for special characters?
    // Test for status 400 code?
    // Test for server error?
  });

  describe('POST /users/:id/expired-link', () => {
    let userId;

    beforeAll(async () => {
      await User.deleteMany({});
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const createdUser = await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: false,
      });
      userId = createdUser._id.toString();
    });

    it('should resend a new verification link successfully', async () => {
      const res = await supertest(app).post(`/users/${userId}/expired-link`).send();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        friendlyMessage: `Hi ${userData.firstName}, a new link has been sent to your email. Please verify.`,
      });
    });

    it('should resend a verification link to a new email address successfully', async () => {
      const newEmail = Buffer.from(`newemail${Date.now()}@example.com`).toString('base64');
      const res = await supertest(app).post(`/users/${userId}/expired-link?newEmail=${newEmail}`).send();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        friendlyMessage: 'A new verification link has been sent to your updated email address.',
      });
    });

    it('should return an error for an invalid user ID', async () => {
      const invalidUserId = new ObjectId();
      const res = await supertest(app).post(`/users/${invalidUserId}/expired-link`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        friendlyMessage: 'There was an error sending a new verification email. Please try again or contact support.',
      });
    });
  });

  describe('POST /users/:id/update-email-verification', () => {
    let userId, oldEmail;

    beforeAll(async () => {
      await User.deleteMany({});
      oldEmail = userData.email;
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const createdUser = await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: false,
      });
      userId = createdUser._id.toString();
    });

    it('should update the email address successfully and send a verification link', async () => {
      const newEmail = `newemail${Date.now()}@example.com`;
      const res = await supertest(app)
        .post(`/users/${userId}/update-email-verification`)
        .send({ userId, oldEmail, newEmail });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        friendlyMessage: `We've sent a verification link to ${newEmail}. Please click on the link that has been sent to your email to verify your updated email address. The link expires in 30 minutes.`,
        invalidCredentials: false,
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const newEmail = `newemail${Date.now()}@example.com`;
      const res = await supertest(app).post(`/users/${userId}/update-email-verification`).send({ newEmail });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: expect.any(String),
        friendlyMessage: 'There was an issue re-sending your verification email. Please try again or contact support',
      });
    });

    it('should return an error for mismatching old email', async () => {
      const newEmail = `newemail${Date.now()}@example.com`;
      const wrongOldEmail = `wrong${oldEmail}`;
      const res = await supertest(app)
        .post(`/users/${userId}/update-email-verification`)
        .send({ userId, oldEmail: wrongOldEmail, newEmail });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        friendlyMessage: `This email address does not match the provided account.`,
      });
    });

    it('should return an error when the new email already exists', async () => {
      const duplicateEmail = oldEmail;
      const res = await supertest(app)
        .post(`/users/${userId}/update-email-verification`)
        .send({ userId, oldEmail, newEmail: duplicateEmail });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        friendlyMessage: `An account with email ${duplicateEmail} already exists.`,
        existingAccount: true,
      });
    });
  });

  describe('GET /:id/verify/:token', () => {
    let userId, validToken, expiredToken;

    beforeAll(async () => {
      await User.deleteMany({});
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const createdUser = await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: false,
      });
      userId = createdUser._id.toString();
      validToken = newToken(userId);
      expiredToken = newToken(userId, false, true);
    });

    it('should indicate the token is expired', async () => {
      const res = await supertest(app).get(`/${userId}/verify/${expiredToken}`);
      expect(res.status).toBe(299);
      expect(res.body).toEqual({
        msg: 'This url is expired. Please request a new link.',
        isExpired: true,
      });
    });

    it('should indicate the link is invalid', async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const res = await supertest(app).get(`/${invalidUserId}/verify/${validToken}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ msg: 'Invalid link' });
    });

    it('should verify the user email successfully', async () => {
      const res = await supertest(app).get(`/${userId}/verify/${validToken}`);
      expect(res.status).toBe(200);
      expect(res.body.msg).toBe(
        `Hi, ${userData.firstName}! Your email has been successfully verified. Please Sign In to finish setting up your account.`,
      );
      expect(res.body.user).toBeDefined();
      expect(res.body.bootcamprNewToken).toBeDefined();
      const updatedUser = await User.findById(userId);
      expect(updatedUser.verified).toBe(true);
    });
  });

  // NOTE: verifyValidToken is not really a route, but a helper function
  // for now i will skip this test until we have a better understanding of how to test this
  // or even test it at all
  // describe('GET /verify-token-expiration/:emailToken', () => {});

  describe('POST /confirm-password/:userID', () => {
    let userId;

    beforeAll(async () => {
      await User.deleteMany({});
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const createdUser = await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: false,
      });
      userId = createdUser._id.toString();
    });

    it('should confirm the password successfully for a valid user and correct password', async () => {
      const res = await supertest(app).post(`/confirm-password/${userData}`).send({
        email: userData.email,
        password: userData.password,
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ passwordConfirmed: true });
    });

    it('should fail to confirm the password with an incorrect password', async () => {
      const res = await supertest(app).post(`/confirm-password/${userId}`).send({
        email: userData.email,
        password: 'incorrectPassword',
      });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ passwordConfirmed: false });
    });

    it('should fail to confirm the password for a non-existent userID', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const res = await supertest(app).post(`/confirm-password/${nonExistentUserId}`).send({
        email: userData.email,
        password: 'testPassword123',
      });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ passwordConfirmed: false });
    });
  });

  describe('PATCH /update-password/:userID', () => {
    let userId;
    let oldPassword = userData.password;
    let newPassword = `newPassword${Date.now()}`;
    beforeAll(async () => {
      await User.deleteMany({});
      const hashedPassword = await bcrypt.hash(oldPassword, SALT_ROUNDS);
      const createdUser = await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: true,
      });
      userId = createdUser._id.toString();
    });

    it('should fail to update the password when new password is the same as the old password', async () => {
      const res = await supertest(app)
        .patch(`/update-password/${userId}`)
        .send({ password: oldPassword, newPassword: oldPassword });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: false,
        message: 'New password cannot be the same as your old password.',
        friendlyMessage: 'Sorry, your new password cannot be the same as your old password.',
      });
    });

    it('should successfully update the password', async () => {
      const res = await supertest(app)
        .patch(`/update-password/${userId}`)
        .send({ password: oldPassword, newPassword: newPassword });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: true,
        message: 'Password Updated',
        friendlyMessage: 'Your password has been successfully updated!',
      });
    });

    it('should fail to update the password with incorrect current password', async () => {
      const res = await supertest(app)
        .patch(`/update-password/${userId}`)
        .send({ password: 'wrongPassword', newPassword: newPassword });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: false,
        message: 'Current password is incorrect.',
        friendlyMessage: 'Your password is incorrect.',
      });
    });
  });

  describe('POST /reset-password', () => {
    let userId, userEmail;

    beforeAll(async () => {
      await User.deleteMany({});
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const createdUser = await User.create({
        ...userData,
        passwordDigest: hashedPassword,
        verified: true,
      });
      userId = createdUser._id.toString();
      userEmail = createdUser.email;
    });

    it("should return an error if the email does not match the logged-in user's email", async () => {
      const wrongEmail = `wrong${Date.now()}@example.com`;
      const res = await supertest(app).post('/reset-password').send({ email: wrongEmail, userId: userId });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: false,
        message: `The email address ${wrongEmail} is not associated with the user's account.`,
        friendlyMessage: 'Incorrect email. Please enter the email address associated with your account.',
      });
    });

    it('should send a reset password verification email successfully', async () => {
      const res = await supertest(app).post('/reset-password').send({ email: userEmail, userId: userId });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: true,
        message: 'Reset password verification email successfully sent.',
        friendlyMessage: `We've sent a verification link to your email address. Please click on the link that has been sent to your email to reset your account password. The link expires in 30 minutes.`,
        invalidCredentials: false,
      });
    });

    it('handles errors during the reset password process gracefully', async () => {
      const invalidUserId = `invalidUserId${Date.now()}`;
      const invalidEmail = `invalidEmail${Date.now()}@example.com`;
      const res = await supertest(app).post('/reset-password').send({ email: invalidEmail, userId: invalidUserId });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: false,
        message: expect.any(String),
        friendlyMessage:
          'There was an issue sending your reset password verification email. Please try again or contact support.',
      });
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
  });
});
