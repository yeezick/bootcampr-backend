import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import config from './config.js';

 const globalSetup= async ()=>{
  if (config.Memory) {
    const instance = await MongoMemoryServer.create();
    const uri = instance.getUri();
    global.__MONGOINSTANCE__ = instance;
    process.env.MONGODB_URI = uri.slice(0, uri.lastIndexOf('/'));
  } else {
    process.env.MONGODB_URI = `mongodb://${config.IP}:${config.Port}`;
  }

  // Cleanup logic
  await mongoose.connect(`${process.env.MONGODB_URI}/${config.Database}`);
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
}

export default globalSetup;

