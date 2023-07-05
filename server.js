import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';
import { Server } from 'socket.io';
import http from 'http';
import PushNotifications from './models/notifications.js';
import User from './models/user.js';
import { google } from 'googleapis';
import colors from 'colors';

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

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    transports: ['websocket'],
    origin: process.env.BASE_URL,
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);

io.on('connection', (socket) => {
  socket.on('setUserId', async (userId) => {
    if (userId) {
      const oneUser = await User.findById(userId).lean().exec();
      if (oneUser) {
        console.log(`Socket: User with id ${userId} has connected.`.cyan.bold.underline);
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

  socket.on('join-conversation', (data) => {
    socket.join(data.chatRoom);
    console.log(`Socket: User with ID: ${data.authUser} joined chat room: ${data.chatRoom}`.cyan);
  });

  socket.on('send-message', (data) => {
    socket.broadcast.emit('message-from-server', data.newMessage);
    console.log(`Socket: New message received!`.cyan);
  });

  socket.on('read-message', (data) => {
    socket.broadcast.emit('read-message-check', `Unread message opened by user: ${data.authUser}`);
  });

  socket.on('check-any-unread-messages', (data) => {
    socket.broadcast.emit('unread-messages-checked', data);
  });

  socket.on('disconnect', (socket) => {
    console.log('User left.');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Express server application is running on port: ${PORT}\n\n`.yellow.bold.underline);
});
