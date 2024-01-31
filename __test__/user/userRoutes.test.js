import supertest from 'supertest';
import app from '../../server';
import User from '../../models/user';
import mongoose from 'mongoose';

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
  

});



