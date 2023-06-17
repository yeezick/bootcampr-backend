import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';
import * as io from 'socket.io';
import { createServer } from 'http';
import PushNotifications from './models/notifications.js';
import User from './models/user.js';
import { google } from 'googleapis';

export const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.CALENDAR_CREDS),
  scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  clientOptions: {
    subject: process.env.CALENDAR_EMAIL,
  },
});

export const calendar = google.calendar({ version: 'v3', auth });

const app = express();
const PORT = process.env.PORT || 8001;

const server = createServer(app);
const socketio = new io.Server(server, db, {
  cors: {
    transports: ['websocket'],
    origin: '*',
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);

socketio.on('connection', (socket) => {
  socket.on('setUserId', async (userId) => {
    if (userId) {
      const oneUser = await User.findById(userId).lean().exec();
      if (oneUser) {
        console.log(`Socket: User with id ${userId} has connected.`);
      } else {
        console.log(`No user with id ${userId}`);
      }
    }
    PushNotifications.watch().on('change', async () => {
      const notifications = await PushNotifications.find({ user: userId, read: false }).lean();
      socket?.emit('notificationsLength', notifications.length || 0);
    });
    socket.on('disconnect', () => {
      userId = null;
    });
  });
});

server.listen(PORT, () => {
  console.log(`Express server application is running on port: ${PORT}\n\n`);
});
