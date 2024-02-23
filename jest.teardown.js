import { MongoMemoryServer } from 'mongodb-memory-server';
import config from './config.js';

const globalTeardown = async () => {
  try {
    if (config.Memory) {
      const instance = global.__MONGOINSTANCE__;
      await instance.stop();
    }
  } catch (error) {
    console.error('Error during global teardown:', error);
    process.exit(1);
  }
};

export default globalTeardown;
