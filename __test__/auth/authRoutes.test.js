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

const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
  return User.create({
    ...userData,
    passwordDigest: hashedPassword,
    verified: true,
  });
};

describe('Auth Routes', () => {
  let testUserId, testUserEmail, validToken, expiredToken;
  const newEmail = `newemail${Date.now()}@example.com`;
  let invalidUserId = new mongoose.Types.ObjectId();
  const invalidEmail = `invalidEmail${Date.now()}@example.com`;

  beforeEach(async () => {
    await User.deleteMany({});
    const user = await createUser(userData);
    testUserId = user._id.toString();
    testUserEmail = user.email;
    validToken = newToken(testUserId);
    expiredToken = newToken(testUserId, false, true);
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /sign-up', () => {
    beforeEach(async () => {
      await User.deleteMany({});
    });

    it('should return 201 and confirm user creation and email verification sent', async () => {
      const res = await supertest(app).post('/sign-up').send(userData);
      expect(res.status).toBe(201);
      expect(isValidObjectId(res.body.newUser)).toBe(true);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: `We've sent a verification link to ${testUserEmail}. Please click on the link that has been sent to your email to verify your account and continue the registration process. The link expires in 30 minutes.`,
          invalidCredentials: false,
          existingAccount: false,
        }),
      );
    });

    it('should return 409 and confirm user email already exists', async () => {
      await createUser(userData);
      const res = await supertest(app).post('/sign-up').send(userData);
      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        message: `An account with Email ${testUserEmail} already exists. Please try a different email address to register, or Sign In to your existing Bootcampr account.`,
        invalidCredentials: true,
        existingAccount: true,
      });
    });

    it.each([['firstName'], ['lastName'], ['email'], ['password']])(
      'should return 400 for missing field %s',
      async (field) => {
        const { [field]: removed, ...partialData } = userData;
        const res = await supertest(app).post('/sign-up').send(partialData);
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
          message: `Missing required fields: ${field}`,
          invalidCredentials: true,
          existingAccount: false,
        });
      },
    );

    // NOTE: Potential Additional Tests for Sign Up:
    // Validate password Strength or Length?
    // Combination of Invalid Fields?
  });

  describe('POST /sign-in', () => {
    it('should sign in an existing user and return a token', async () => {
      const res = await supertest(app).post('/sign-in').send({
        email: testUserEmail,
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
        email: testUserEmail,
        password: 'wrong_password',
      });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        invalidCredentials: true,
        message: "User ID and password don't match. Please try again.",
        tMsg: "User ID and password don't match. Please try again.",
      });
    });

    // NOTE: Potential Additional Tests for Sign Up:
    // Test for user not verified?
    // Test for server error?
  });

  describe('GET /verify', () => {
    let validBodyToken;

    beforeAll(async () => {
      const res = await supertest(app).post('/sign-in').send({
        email: testUserEmail,
        password: userData.password,
      });
      validBodyToken = res.body.token;
    });

    it('should verify a user with a valid token', async () => {
      const res = await supertest(app).get('/verify').set('Authorization', `Bearer ${validBodyToken}`);
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
      const invalidEmailFormat = 'invalid-email';
      const res = await supertest(app).get(`/verify-email/${invalidEmailFormat}`);
      expect(res.status).toBe(422);
      expect(res.body).toEqual({ error: 'Invalid email.' });
    });

    it('should return an error if the email address already exists', async () => {
      const existingEmail = testUserEmail;
      const res = await supertest(app).get(`/verify-email/${existingEmail}`);
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'Email address already exists.' });
    });

    // NOTE: Potential Additional Tests for verify-email/:email:
    // Test for case sensitivity?
    // Test for trailing spaces?
    // Test for special characters?
    // Test for status 400 code?
    // Test for server error?
  });

  describe('POST /users/:id/expired-link', () => {
    it('should resend a new verification link successfully', async () => {
      const res = await supertest(app).post(`/users/${testUserId}/expired-link`).send();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        friendlyMessage: `Hi ${userData.firstName}, a new link has been sent to your email. Please verify.`,
      });
    });

    it('should resend a verification link to a new email address successfully', async () => {
      const newEncodedEmail = Buffer.from(`newemail${Date.now()}@example.com`).toString('base64');
      const res = await supertest(app).post(`/users/${testUserId}/expired-link?newEmail=${newEncodedEmail}`).send();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        friendlyMessage: 'A new verification link has been sent to your updated email address.',
      });
    });

    it('should return an error for an invalid user ID', async () => {
      const res = await supertest(app).post(`/users/${invalidUserId}/expired-link`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        friendlyMessage: 'There was an error sending a new verification email. Please try again or contact support.',
      });
    });
  });

  describe('POST /users/:id/update-email-verification', () => {
    it('should update the email address successfully and send a verification link', async () => {
      const res = await supertest(app)
        .post(`/users/${testUserId}/update-email-verification`)
        .send({ userId: testUserId, oldEmail: testUserEmail, newEmail: newEmail });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        friendlyMessage: `We've sent a verification link to ${newEmail}. Please click on the link that has been sent to your email to verify your updated email address. The link expires in 30 minutes.`,
        invalidCredentials: false,
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      const res = await supertest(app)
        .post(`/users/${testUserId}/update-email-verification`)
        .send({ newEmail: newEmail });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: expect.any(String),
        friendlyMessage: 'There was an issue re-sending your verification email. Please try again or contact support',
      });
    });

    it('should return an error for mismatching old email', async () => {
      const wrongOldEmail = `wrong${testUserEmail}@example.com`;
      const res = await supertest(app)
        .post(`/users/${testUserId}/update-email-verification`)
        .send({ userId: testUserId, oldEmail: wrongOldEmail, newEmail: newEmail });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        friendlyMessage: `This email address does not match the provided account.`,
      });
    });

    it('should return an error when the new email already exists', async () => {
      const duplicateEmail = testUserEmail;
      const res = await supertest(app)
        .post(`/users/${testUserId}/update-email-verification`)
        .send({ userId: testUserId, oldEmail: testUserEmail, newEmail: duplicateEmail });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        friendlyMessage: `An account with email ${duplicateEmail} already exists.`,
        existingAccount: true,
      });
    });
  });

  describe('GET /:id/verify/:token', () => {
    it('should indicate the token is expired', async () => {
      const res = await supertest(app).get(`/${testUserId}/verify/${expiredToken}`);
      expect(res.status).toBe(299);
      expect(res.body).toEqual({
        msg: 'This url is expired. Please request a new link.',
        isExpired: true,
      });
    });

    it('should indicate the link is invalid', async () => {
      const res = await supertest(app).get(`/${invalidUserId}/verify/${validToken}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ msg: 'Invalid link' });
    });

    it('should verify the user email successfully', async () => {
      const res = await supertest(app).get(`/${testUserId}/verify/${validToken}`);
      expect(res.status).toBe(200);
      expect(res.body.msg).toBe(
        `Hi, ${userData.firstName}! Your email has been successfully verified. Please Sign In to finish setting up your account.`,
      );
      expect(res.body.user).toBeDefined();
      expect(res.body.bootcamprNewToken).toBeDefined();
      const updatedUser = await User.findById(testUserId);
      expect(updatedUser.verified).toBe(true);
    });
  });

  // NOTE: verifyValidToken is not really a route, but a helper function
  // for now i will skip this test until we have a better understanding of how to test this
  // or even test it at all
  // describe('GET /verify-token-expiration/:emailToken', () => {});

  describe('POST /confirm-password/:userID', () => {
    it('should confirm the password successfully for a valid user and correct password', async () => {
      const res = await supertest(app).post(`/confirm-password/${testUserId}`).send({
        email: testUserEmail,
        password: userData.password,
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ passwordConfirmed: true });
    });

    it('should fail to confirm the password with an incorrect password', async () => {
      const res = await supertest(app).post(`/confirm-password/${testUserId}`).send({
        email: testUserEmail,
        password: 'incorrectPassword',
      });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ passwordConfirmed: false });
    });

    it('should fail to confirm the password for a non-existent userID', async () => {
      const nonExistentUserId = ObjectId();
      const res = await supertest(app).post(`/confirm-password/${nonExistentUserId}`).send({
        email: testUserEmail,
        password: 'testPassword123',
      });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ passwordConfirmed: false });
    });
  });

  describe('PATCH /update-password/:userID', () => {
    let oldPassword = userData.password;
    let newPassword = `newPassword${Date.now()}`;

    it('should fail to update the password when new password is the same as the old password', async () => {
      const res = await supertest(app)
        .patch(`/update-password/${testUserId}`)
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
        .patch(`/update-password/${testUserId}`)
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
        .patch(`/update-password/${testUserId}`)
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
    it("should return an error if the email does not match the logged-in user's email", async () => {
      const res = await supertest(app).post('/reset-password').send({ email: invalidEmail, userId: testUserId });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: false,
        message: `The email address ${invalidEmail} is not associated with the user's account.`,
        friendlyMessage: 'Incorrect email. Please enter the email address associated with your account.',
      });
    });

    it('should send a reset password verification email successfully', async () => {
      const res = await supertest(app).post('/reset-password').send({ email: testUserEmail, userId: testUserId });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        status: true,
        message: 'Reset password verification email successfully sent.',
        friendlyMessage: `We've sent a verification link to your email address. Please click on the link that has been sent to your email to reset your account password. The link expires in 30 minutes.`,
        invalidCredentials: false,
      });
    });

    it('handles errors during the reset password process gracefully', async () => {
      invalidUserId = `invalidUserId${Date.now()}`;
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
});
