import mongoose from 'mongoose';
import 'dotenv/config.js';

// set connection location
const MONGODB_URI = "mongodb+srv://dev-bc-swe:dN4dvDZ4jIOGiXnk@dev-bc-mdb.2kox7.mongodb.net/test";

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
