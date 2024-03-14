import mongoose from 'mongoose';

const mockSend = jest.fn();

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: mockSend.mockImplementation((email) => {
    if (email.subject.includes('Fail this email')) {
      return Promise.reject(new Error('Simulated send failure'));
    }

    return Promise.resolve([{ statusCode: 202 }]);
  }),
}));

global.mockSendGridSend = mockSend;

beforeAll(async () => {
  await mongoose.connect(process.env['MONGODB_URI']);
});

afterAll(async () => {
  await mongoose.disconnect();
});
