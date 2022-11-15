import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';


const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);

db.on('connected', () => {
  console.log('Connected to MongoDB!');
  app.listen(PORT, () => {
    console.log(`Express server application is running on port: ${PORT}\n\n`);
  });
});
