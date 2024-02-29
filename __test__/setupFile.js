import mongoose from "mongoose";

beforeAll(async () => {
    await mongoose.connect(process.env['MONGODB_URI']);
  });
  
afterAll(async () => {
await mongoose.disconnect();
});