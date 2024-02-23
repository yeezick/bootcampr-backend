import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import config from './config.js';

const globalSetup = async () => {
  try {
    if (config.Memory) {
      const instance = await MongoMemoryServer.create();
      const uri = instance.getUri();
      console.log({ uri });
      global.__MONGOINSTANCE__ = instance;
      process.env.MONGODB_URI = uri.slice(0, uri.lastIndexOf('/'));
    } else {
      process.env.MONGODB_URI = `mongodb://${config.IP}:${config.Port}`;
    }
    // Connect to the MongoDB instance
    await mongoose.connect(`${process.env.MONGODB_URI}/${config.Database}`);
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during global setup:', error);
    process.exit(1);
  }
};

export default globalSetup;


