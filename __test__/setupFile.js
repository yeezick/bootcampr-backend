import mongoose from 'mongoose';

// Mock the sendgrid mailer
const mockSend = jest.fn();

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: mockSend.mockImplementation((email) => {
    // Simulate a failure when a specific condition is met (e.g., email contains a certain keyword)
    if (email.subject.includes('Fail this email')) {
      return Promise.reject(new Error('Simulated send failure'));
    }
    // Default to simulating a successful send
    return Promise.resolve([{ statusCode: 202 }]);
  }),
}));

global.mockSendGridSend = mockSend; // Expose the mock to be able to change its behavior in tests

beforeAll(async () => {
  await mongoose.connect(process.env['MONGODB_URI']);
});

afterAll(async () => {
  await mongoose.disconnect();
});
