import supertest from 'supertest';
import fs from 'fs';
import app from '../../server';
import User from '../../models/user';
import mongoose from 'mongoose';
// import { S3Client} from '@aws-sdk/client-s3';
import * as S3ClientModule from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn()
  };
});

const mockSend = jest.fn();
S3ClientModule.S3Client.prototype.send = mockSend;



const { ObjectId } = mongoose.Types;


describe('User Routes', () => {
  describe('GET /users', () => {
    it('should retrieve a list of all users', async () => {
      await User.deleteMany();

      const users = [
        { firstName: 'Felix', lastName:'Owolabi', email: 'felix@example.com', passwordDigest: 'hashedPassword1' },
        { firstName: 'Hector', lastName:'Ilarraza', email: 'hector@example.com', passwordDigest: 'hashedPassword2' },
      ];
      await User.insertMany(users);
      const response = await supertest(app).get('/users');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(users.length);
      expect(response.body[0].firstName).toBe('Felix');
      expect(response.body[0].email).toBe('felix@example.com');
    });

    it('should handle the case where no users are found', async () => {
      await User.deleteMany();

      const response = await supertest(app).get('/users');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'All User not found.', error: 'No users found in the database.' });
    });

    it('should handle errors during the fetch operation', async () => {
      jest.spyOn(User, 'find').mockImplementationOnce(() => {
        throw new Error('Mocked fetch error');
      });
      const response = await supertest(app).get('/users');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error occurred while fetching users.',
        error: 'Mocked fetch error',
      });
    });
  });
  describe('GET /users/:id', () => {
    it('should retrieve a single user by ID', async () => {
      await User.deleteMany()
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordDigest: 'hashedPassword',
      };
  
      const createdUser = await User.create(user);
  
      const response = await supertest(app).get(`/users/${createdUser._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.passwordDigest).toBeUndefined(); // Ensure passwordDigest is not sent
    });
  
    it('should handle the case where the user is not found', async () => {
      const nonExistentUserId = new ObjectId();
  
      const response = await supertest(app).get(`/users/${nonExistentUserId}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found.', error: `No user found with id ${nonExistentUserId}.` });
    });
  
    it('should handle errors during the fetch operation', async () => {
      const errorId = new ObjectId();
  
      jest.spyOn(User, 'findById').mockImplementationOnce(() => {
        throw new Error('Mocked fetch error');
      });
  
      const response = await supertest(app).get(`/users/${errorId}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error occurred while fetching user',
        error: 'Mocked fetch error',
      });
    });
  });
  describe('GET /users/email/:email', () => {
    it('should retrieve a user by email', async () => {
      await User.deleteMany()

      const userEmail = 'john@example.com';
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: userEmail,
        passwordDigest: 'hashedPassword',
      };
  
     const createdUser = await User.create(user);
  
      const response = await supertest(app).get(`/users/email/${userEmail}`);
  
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(String(createdUser._id));
    });
  
    it('should handle the case where the user is not found by email', async () => {
      const nonExistentUserEmail = 'nonexistent@example.com';
  
      const response = await supertest(app).get(`/users/email/${nonExistentUserEmail}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'User not found.',
        error: `No user found with email ${nonExistentUserEmail}.`,
      });
    });
  
    it('should handle errors during the fetch operation', async () => {
      const errorEmail = 'error@example.com';
  
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error('Mocked fetch error');
      });
  
      const response = await supertest(app).get(`/users/email/${errorEmail}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error occurred while fetching user',
        error: 'Mocked fetch error',
      });
    });
  });
  describe('POST /users/:id', () => {
    it('should update user information successfully', async () => {
      const user = {
        role: 'Software Engineer',
        availability: ['Monday', 'Wednesday'],
        firstName: 'Felix',
        lastName: 'Owolabi',
        email: 'felix@example.com',
        passwordDigest: 'hashedPassword',
        bio: 'Test bio',
        links: ['https://github.com/felix', 'https://linkedin.com/in/felix'],
        onboarded: true,
        profilePicture: 'https://example.com/profile.jpg',
        defaultProfilePicture: 'https://example.com/default.jpg',
        hasProfilePicture: true,

      };
  
     const createdUser = await User.create(user);
  
      const updatedInfo = {
        role: 'UX Designer',
        availability: ['Monday', 'Tuesday', 'Thursday'],
        firstName: 'Hector',
        lastName: 'Ilarraza',
        bio: 'Updated bio',
        links: ['https://github.com/hector', 'https://linkedin.com/in/hector'],
        onboarded: false,
        profilePicture: 'https://example.com/new-profile.jpg',
        defaultProfilePicture: 'https://example.com/new-default.jpg',
        hasProfilePicture: false,
      };
  
      const response = await supertest(app)
        .post(`/users/${createdUser._id}`)
        .send(updatedInfo);
  
      expect(response.status).toBe(200);
      expect(response.body.role).toBe(updatedInfo.role);
      expect(response.body.availability).toEqual(updatedInfo.availability);
      expect(response.body.firstName).toBe(updatedInfo.firstName);
      expect(response.body.lastName).toBe(updatedInfo.lastName);
      expect(response.body.bio).toBe(updatedInfo.bio);
      expect(response.body.links).toEqual(updatedInfo.links);
      expect(response.body.onboarded).toBe(updatedInfo.onboarded);
      expect(response.body.profilePicture).toBe(updatedInfo.hasProfilePicture ? user.profilePicture : '');
      expect(response.body.defaultProfilePicture).toBe(updatedInfo.defaultProfilePicture);
      expect(response.body.hasProfilePicture).toBe(updatedInfo.hasProfilePicture);
    });
  
    it('should handle the case where the user is not found during update', async () => {
      const nonExistentUserId = new ObjectId();
  
      const response = await supertest(app)
        .post(`/users/${nonExistentUserId}`)
        .send({
          role: 'Software Engineer',
          availability: ['Monday', 'Wednesday'],
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Test bio',
          links: ['https://github.com/johndoe', 'https://linkedin.com/in/johndoe'],
          onboarded: true,
          profilePicture: 'https://example.com/profile.jpg',
          defaultProfilePicture: 'https://example.com/default.jpg',
          hasProfilePicture: true,
        });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found.' });
    });
  
    it('should handle errors during the update operation', async () => {
      const errorId = new ObjectId();
  
      jest.spyOn(User, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('Mocked update error');
      });
  
      const response = await supertest(app)
        .post(`/users/${errorId}`)
        .send({
          role: 'Developer',
          availability: ['Monday', 'Wednesday'],
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Test bio',
          links: ['https://github.com/johndoe', 'https://linkedin.com/in/johndoe'],
          onboarded: true,
          profilePicture: 'https://example.com/profile.jpg',
          defaultProfilePicture: 'https://example.com/default.jpg',
          hasProfilePicture: true,
        });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Mocked update error' });
    });
  });
  describe('POST /onboarding/:id', () => {
    it('should update user profile successfully', async () => {
      await User.deleteMany()

      const user = await User.create({
        role: 'Software Engineer',
        availability: ['Monday', 'Tuesday'],
        firstName: 'Felix',
        lastName: 'Owolabi',
        email:'felix@example.com',
        passwordDigest:'hashedPassword',
        bio: 'Onboarding bio',
        links: { githubUrl: 'https://github.com/felix' },
      });
  
      const updatedData = {
        role: 'UX Designer',
        availability: ['Monday', 'Wednesday'],
        firstName: 'FelixDev',
        lastName: 'Owolabi',
        bio: 'New bio',
        links: { githubUrl: 'https://github.com/felixdev' },
      };
  
      const response = await supertest(app).post(`/onboarding/${user._id}`).send(updatedData);
  
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User profile updated successfully.');
    });
  
    it('should handle the case where the user profile is not found', async () => {
      const nonExistentUserId = new ObjectId();
  
      const response = await supertest(app).post(`/onboarding/${nonExistentUserId}`).send({
        role: 'Software Engineer',
        availability: ['Monday', 'Wednesday'],
        firstName: 'John',
        lastName: 'Doe',
        bio: 'New Bio',
        links: { website: 'https://example.com' },
      });
  
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User Profile not found.');
    });
  
    it('should handle errors during the update operation', async () => {
      const user = await User.create({
        role: 'UX Designer',
        availability: ['Monday', 'Tuesday'],
        firstName: 'Hector',
        lastName: 'Ilarraza',
        email:'hector@example.com',
        passwordDigest:'hashedpassword1',
        bio: 'Designer bio',
        links: { website: 'https://example.com' },
      });
  
      const mockedError = 'Mocked update error';
  
      jest.spyOn(User, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error(mockedError);
      });
  
      const response = await supertest(app).post(`/onboarding/${user._id}`).send({
        role: 'Software Engineer',
        availability: ['Monday', 'Wednesday'],
        firstName: 'Hector',
        lastName: 'Ilarraza',
        bio: 'Engineer Bio',
        links: { website: 'https://example.com' },
      });
  
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update user profile.');
    });
  });
  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      await User.deleteMany();
  
      const user = await User.create({
        role: 'Software Engineer',
        availability: ['Monday', 'Tuesday'],
        firstName: 'Felix',
        lastName: 'Owolabi',
        email: 'felix@example.com',
        passwordDigest: 'hashedPassword',
        bio: 'Bio for deletion',
        links: { website: 'https://example.com' },
      });
  
      const response = await supertest(app).delete(`/users/${user._id}`);
  
      expect(response.status).toBe(200);
      expect(response.body.deletionStatus).toBe(true);
      expect(response.body.message).toBe('User deleted.');
  
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  
    it('should handle the case where the user is not found during deletion', async () => {
      const nonExistentUserId = new ObjectId();
  
      const response = await supertest(app).delete(`/users/${nonExistentUserId}`);
  
      expect(response.status).toBe(500);
      expect(response.body.deletionStatus).toBe(false);
      expect(response.body.error).toBe('User not found.');
    });
  
    it('should handle errors during the deletion operation', async () => {
      const user = await User.create({
        role: 'UX Designer',
        availability: ['Monday', 'Tuesday'],
        firstName: 'Hector',
        lastName: 'Ilarraza',
        email: 'hector@example.com',
        passwordDigest: 'hashedpassword1',
        bio: 'Designer bio',
        links: { website: 'https://example.com' },
      });
  
      const mockedError = 'Mocked deletion error';
  
      jest.spyOn(User, 'findByIdAndDelete').mockImplementationOnce(() => {
        throw new Error(mockedError);
      });
  
      const response = await supertest(app).delete(`/users/${user._id}`);
  
      expect(response.status).toBe(500);
      expect(response.body.deletionStatus).toBe(false);
      expect(response.body.error).toBe(mockedError);
    });
  });
  describe('POST /users/:id/addImage', () => {
    it('should successfully add image to S3 bucket ', async () => {
      const user = await User.create({
        role: 'Software Engineer',
        availability: ['Monday', 'Tuesday'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordDigest: 'hashedPassword',
        bio: 'User bio',
        links: { githubUrl: 'https://github.com/john' },
      });

      mockSend.mockResolvedValue({})
      const imageBuffer = fs.readFileSync(`${__dirname}/../Group.png`);

      const response = await supertest(app)
        .post(`/users/${user._id}/addImage`)
        .attach('image', imageBuffer, 'Group.png');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: 'image sent successfully' });
    });

  });
  describe('DELETE /users/:id/deleteImage',() => {
    it('should delete image from S3 bucket and update user profilePicture', async () => {
    await User.deleteMany()
    // Create a user with a profilePicture to test with
    const user = await User.create({
      role: 'Software Engineer',
      availability: ['Monday', 'Tuesday'],
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordDigest: 'hashedPassword',
      bio: 'User bio',
      links: { githubUrl: 'https://github.com/john' },
      profilePicture: '../Group.png',
    });

    mockSend.mockResolvedValue({})
    // Use supertest to make a request to the deleteImage endpoint
    const response = await supertest(app).delete(`/users/${user._id}/deleteImage`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: 'image deleted successfully' });
    const updatedUser = await User.findById(user._id);
   expect(updatedUser.profilePicture).toBeNull();

  });
  it('should check if the user is not found', async () => {
    await User.deleteMany()

    const nonExistentUserId = new ObjectId();
  
    mockSend.mockResolvedValue({});
    const response = await supertest(app).delete(`/users/${nonExistentUserId}/deleteImage`);
  
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found' });
  });
  
});

  describe('GET /users/:userId/emailPreferences', () => {
    it('should retrieve email preferences for a user', async () => {
      await User.deleteMany();

      const userPreferences = {
        emailPreferences: {
        bootcamprUpdates: true,
        newsletters: true,
        projectUpdates: true,
        eventInvitations: true,
        },
      };
      
      const user = await User.create({
        role: 'Software Engineer',
        availability: ['Monday', 'Tuesday'],
        firstName: 'Felix',
        lastName: 'Owolabi',
        email: 'felix@example.com',
        passwordDigest: 'hashedPassword',
        bio: 'Bio for deletion',
        links: { website: 'https://example.com' },
        ...userPreferences
      });
      const response = await supertest(app).get(`/users/${user._id}/emailPreferences`);

      expect(response.status).toBe(200);
      expect(response.body.emailPreferences).toEqual( userPreferences.emailPreferences
      );
      expect(response.body).toHaveProperty('emailPreferences.bootcamprUpdates', true);
      expect(response.body).toHaveProperty('emailPreferences.newsletters', true);
      expect(response.body).toHaveProperty('emailPreferences.projectUpdates', true);
      expect(response.body).toHaveProperty('emailPreferences.eventInvitations', true);
    });

    it('should handle the case where the user is not found', async () => {
      const nonExistentUserId = new ObjectId();

      const response = await supertest(app).get(`/users/${nonExistentUserId}/emailPreferences`);
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should handle errors during the fetch operation', async () => {
      const userId = new ObjectId();
      jest.spyOn(User, 'findById').mockImplementationOnce(() => {
        throw new Error('Mocked fetch error');
      });
      const response = await supertest(app).get(`/users/${userId}/emailPreferences`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Mocked fetch error' });
    });
  });
  describe('POST /users/:userId/updateEmailPreferences', () => {
    it('should update email preferences for a user', async () => {
      await User.deleteMany();
  
      const userPreferences = {
        emailPreferences: {
          bootcamprUpdates: true,
          newsletters: true,
          projectUpdates: true,
          eventInvitations: true,
        },
      };
  
      const user = await User.create({
        role: 'Software Engineer',
        availability: ['Monday', 'Tuesday'],
        firstName: 'Felix',
        lastName: 'Owolabi',
        email: 'felix@example.com',
        passwordDigest: 'hashedPassword',
        bio: 'Bio for deletion',
        links: { website: 'https://example.com' },
        ...userPreferences,
      });
  
      const updatedPreferences = {
        bootcamprUpdates: false,
        newsletters: true,
        projectUpdates: false,
        eventInvitations: true,
      };
  
      const response = await supertest(app)
        .post(`/users/${user._id}/updateEmailPreferences`)
        .send(updatedPreferences);
  
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(updatedPreferences);
    });
  
    it('should handle the case where the user is not found', async () => {
      const nonExistentUserId = new ObjectId();
      const updatedPreferences = {
        bootcamprUpdates: false,
        newsletters: true,
        projectUpdates: false,
        eventInvitations: true,
      };
  
      const response = await supertest(app)
        .post(`/users/${nonExistentUserId}/updateEmailPreferences`)
        .send(updatedPreferences);
  
      expect(response.status).toBe(400);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ msg: 'Error updating user email preferences' });
    });
  
    it('should handle errors during the update operation', async () => {
      const userId = new ObjectId();
      const updatedPreferences = {
        bootcamprUpdates: false,
        newsletters: true,
        projectUpdates: false,
        eventInvitations: true,
      };
  
      jest.spyOn(User, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('Mocked update error');
      });
  
      const response = await supertest(app)
        .post(`/users/${userId}/updateEmailPreferences`)
        .send(updatedPreferences);
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ status: false, message: 'Mocked update error' });
    });
  });
  
  
  
});



