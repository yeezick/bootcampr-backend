import { MongoMemoryServer } from 'mongodb-memory-server';
import config from './config.js';

const globalTeardown = async () => {
  if (config.Memory) {
    const instance = global.__MONGOINSTANCE__;
    await instance.stop();
  }
};

export default globalTeardown;

