import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import { google } from 'googleapis';
import colors from 'colors';
import routes from './routes/index.js';
import http from 'http';
import PushNotifications from './models/notifications.js';
import { newMessageNotificationEmail } from './controllers/auth/emailVerification.js';
import { initSocket } from './socket.js';

const app = express();
const PORT = process.env.PORT || 8001;

const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);

httpServer.listen(PORT, async () => {
  console.log(`Express server application is running on port: ${PORT}\n\n`.yellow.bold.underline);

  try {
    // Call the newMessageNotificationEmail function at the scheduled time
    await newMessageNotificationEmail();
  } catch (error) {
    console.error('Error scheduling email notification job:', error.message);
  }
});

export default app;
