import supertest from 'supertest';
import app from '../../server';
import User from '../../models/user';

describe('User Routes', () => {
  describe('GET /users', () => {
    it('should retrieve a list of all users', async () => {
      const users = [
        { firstName: 'Felix', lastName:'Owolabi', email: 'felix.@example.com', passwordDigest: 'hashedPassword1' },
        { firstName: 'Hector', lastName:'Ilarraza', email: 'hector@example.com', passwordDigest: 'hashedPassword2' },
      ];
      await User.insertMany(users);
      const response = await supertest(app).get('/users').timeout(10000);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(users.length);
      expect(response.body[0].firstName).toBe('Felix');
      expect(response.body[0].email).toBe('felix.@example.com');
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
});



