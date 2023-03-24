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

// Test suite for the "getAllUsers" function
describe('getAllUsers', () => {
  // Test if it returns all users
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

  // Test if it returns a 404 error when no users are found
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

// Test suite for the "getOneUser" function
describe('getOneUser', () => {
  // Test if it returns a single user
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

  // Test if it returns a 404 error when the user is not found
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

// Test suite for the "deleteUser" function
describe('deleteUser', () => {
  // Test if it deletes a user
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

  // Test if it returns a 500 error when an error occurs during the deletion
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

// Test suite for the "updateUserInfo" function
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

  // Test if the function updates user info
  it('should update user info', async () => {
    const req = {
      params: { id: 'testUserId' },
      body: { name: 'New Name' },
    };
    const expectedResponse = { image: 'updated-image-url' };
    updateUserInfoMock.mockReturnValueOnce({ name: 'New Name' });
    updatingImageMock.mockReturnValueOnce(expectedResponse);

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await updateUserInfo(req, res);

    expect(updateUserInfoMock).toHaveBeenCalledWith('testUserId', { name: 'New Name' }, { new: true });
    expect(updatingImageMock).toHaveBeenCalledWith('testUserId');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expectedResponse);
  });

  // Test if it returns an error when the user is not found
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

  // Test if it returns a 404 error when an error occurs during the update
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
