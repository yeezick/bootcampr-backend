// Import necessary modules and functions
import mongoose from 'mongoose';
import User from '../../models/user.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getAllUsers, getOneUser, deleteUser, updateUserInfo } from '../../controllers/user/users';
import * as addingImageModule from '../../controllers/user/addingImage';

const { ObjectId } = mongoose.Types;
let mongoServer;

// Set up an in-memory MongoDB server and connect to it before running any tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Disconnect from the MongoDB server and stop it after all tests have run
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Seed the User collection with three sample users before each test
beforeEach(async () => {
  await User.insertMany([
    {
      firstName: 'Hector',
      lastName: 'Ilarraza',
      email: 'hector@example.com',
      passwordDigest: 'dummy_password_digest',
    },
    {
      firstName: 'Koffi',
      lastName: 'Hassou',
      email: 'koffi@example.com',
      passwordDigest: 'dummy_password_digest',
    },
    {
      firstName: 'Jason',
      lastName: 'Martinez',
      email: 'jason@example.com',
      passwordDigest: 'dummy_password_digest',
    },
  ]);
});

// Delete all User documents after each test
afterEach(async () => {
  await User.deleteMany({});
});

describe('getAllUsers', () => {
  it('returns all users', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ firstName: 'Hector', lastName: 'Ilarraza', email: 'hector@example.com' }),
        expect.objectContaining({ firstName: 'Koffi', lastName: 'Hassou', email: 'koffi@example.com' }),
        expect.objectContaining({ firstName: 'Jason', lastName: 'Martinez', email: 'jason@example.com' }),
      ]),
    );
  });

  it('returns a 404 error if no users are found', async () => {
    await User.deleteMany();
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'All User not found.', error: expect.any(String) });
  });
});

describe('getOneUser', () => {
  it('returns a single user', async () => {
    const users = await User.find();
    const req = { params: { id: users[0]._id } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await getOneUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Hector', lastName: 'Ilarraza', email: 'hector@example.com' }),
    );
  });

  it('returns a 404 error if the user is not found', async () => {
    const req = { params: { id: new ObjectId() } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await getOneUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found.', error: expect.any(String) });
  });
});

describe('deleteUser', () => {
  it('deletes a user', async () => {
    const users = await User.find();
    const req = { params: { id: users[0]._id } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ deletionStatus: true, message: 'User deleted.' });
    const remainingUsers = await User.find();
    expect(remainingUsers).toHaveLength(2);
  });

  it('returns a 500 error if an error occurs', async () => {
    const req = {
      params: { id: new ObjectId() },
    };
    jest.spyOn(User, 'findByIdAndDelete').mockImplementationOnce(() => {
      throw new Error('Error deleting user.');
    });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ deletionStatus: false, error: 'Error deleting user.' });
  });
});

describe('updateUserInfo', () => {
  let updateUserInfoMock;
  let updatingImageMock;

  // Set up mocks for the "findByIdAndUpdate" and "updatingImage" functions
  beforeEach(() => {
    updateUserInfoMock = jest.spyOn(User, 'findByIdAndUpdate');
    updatingImageMock = jest.spyOn(addingImageModule, 'updatingImage');
  });

  // Tear down mocks
  afterEach(() => {
    updateUserInfoMock.mockRestore();
    updatingImageMock.mockRestore();
  });

  it('should update user info', async () => {
    const userId = '65b425894495d91f51b89fbf';
    const req = {
      params: { id: userId },
      body: {
        role: 'expectedRole',
        availability: 'expectedAvailability',
        firstName: 'New Name',
        lastName: 'New Last Name',
        bio: 'New Bio',
        links: { website: 'https://example.com' },
        onboarded: true,
        profilePicture: `https://bootcampruserimage.s3.amazonaws.com/${userId}`,
        defaultProfilePicture: 'https://default-image.com/default.jpg',
        hasProfilePicture: true,
      },
    };

    const expectedResponse = {
      availability: 'expectedAvailability',
      bio: 'New Bio',
      defaultProfilePicture: 'https://default-image.com/default.jpg',
      firstName: 'New Name',
      hasProfilePicture: true,
      lastName: 'New Last Name',
      links: {
        website: 'https://example.com',
      },
      onboarded: true,
      profilePicture: `https://bootcampruserimage.s3.amazonaws.com/65b425894495d91f51b89fbf`,
      role: 'expectedRole',
    };

    updateUserInfoMock.mockReturnValueOnce({
      role: 'expectedRole',
      availability: 'expectedAvailability',
      firstName: 'New Name',
      lastName: 'New Last Name',
      bio: 'New Bio',
      links: { website: 'https://example.com' },
      onboarded: true,
      profilePicture: `https://bootcampruserimage.s3.amazonaws.com/${userId}`,
      defaultProfilePicture: 'https://default-image.com/default.jpg',
      hasProfilePicture: true,
    });
    updatingImageMock.mockReturnValueOnce(userId);

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await updateUserInfo(req, res);
    expect(updateUserInfoMock).toHaveBeenCalledWith(
      userId,
      {
        role: 'expectedRole',
        availability: 'expectedAvailability',
        firstName: 'New Name',
        lastName: 'New Last Name',
        bio: 'New Bio',
        links: { website: 'https://example.com' },
        onboarded: true,
        profilePicture: `https://bootcampruserimage.s3.amazonaws.com/${userId}`,
        defaultProfilePicture: 'https://default-image.com/default.jpg',
        hasProfilePicture: true,
      },
      { new: true },
    );
    expect(updatingImageMock).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });

  it('should return an error if user is not found', async () => {
    const req = {
      params: { id: 'testUserId' },
      body: { name: 'New Name' },
    };
    updateUserInfoMock.mockReturnValueOnce(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
  });

  it('should return a 404 error if an error occurs', async () => {
    const req = {
      params: { id: 'testUserId' },
      body: { name: 'New Name' },
    };
    updateUserInfoMock.mockImplementationOnce(() => {
      throw new Error('Error updating user info.');
    });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error updating user info.' });
  });
});
