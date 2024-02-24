import mongoose from 'mongoose';
import 'dotenv/config.js';

let MONGODB_URI;

if (process.env.MONGODB_ENV === 'local') {
  console.log('Running MongoDB locally');
  MONGODB_URI = process.env.MONGODB_LOCAL_URI;
} else {
  console.log('Running MongoDB via Atlas');
  MONGODB_URI = process.env.MONGODB_URI;
}

// set connection location
mongoose.set('strictQuery', false);
mongoose.set('returnOriginal', false); //for findByAndUpdate to return a reference to object at location

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  });

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB has disconnected!');
});

mongoose.connection.on('error', (error) => {
  console.error(`Error connecting to MongoDB: ${error}`);
});

export default mongoose.connection;
