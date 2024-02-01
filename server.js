import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import { google } from 'googleapis';
import colors from 'colors';
import routes from './routes/index.js';
import { Server } from 'socket.io';
import http from 'http';
import PushNotifications from './models/notifications.js';
import User from './models/user.js';
import { getTotalUnreadCount, getReceiverParticipants, markMessagesAsRead } from './controllers/chat/thread.js';
import { newMessageNotificationEmail } from './controllers/auth/emailVerification.js';

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
        socket.join(userId.toString());
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
    socket.join(data.chatRoomId);
    console.log(`Socket: User with ID: ${data.activeUserId} joined chat room: ${data.chatRoomId}`.cyan);
  });
  socket.on('leave-conversation', (data) => {
    socket.leave(data.chatRoomId);
    console.log(`Socket: User with ID: ${data.activeUserId} left chat room: ${data.chatRoomId}`);
  });

  socket.on('send-message', async (receivedMessage) => {
    io.to(receivedMessage.chatRoomId).emit('message-from-server', receivedMessage);
    try {
      const participantIds = await getReceiverParticipants(
        receivedMessage.chatRoomId,
        receivedMessage.senderId,
        receivedMessage.chatType,
      );

      const results = await Promise.all(
        participantIds.map(async (participantId) => {
          const unreadCount = await getTotalUnreadCount(participantId);
          return { participantId, unreadCount };
        }),
      );
      results.forEach(({ participantId, unreadCount }) => {
        io.to(participantId.toString()).emit('update-unread-count', unreadCount);
        io.to(participantId.toString()).emit('unread-message', receivedMessage);
      });
    } catch (error) {
      console.error('Error in socket send message: ', error);
    }
  });

  socket.on('mark-message-as-read', async (chatInfo) => {
    const { chatRoomId, chatType, activeUserId } = chatInfo;
    try {
      await markMessagesAsRead(chatRoomId, chatType, activeUserId);
      const unreadCount = await getTotalUnreadCount(activeUserId);
      io.to(activeUserId.toString()).emit('update-unread-count', unreadCount);
    } catch (error) {
      console.error('Error in socket mark as read: ', error);
    }
  });

  socket.on('disconnect', (socket) => {
    console.log('User left.');
  });
});

httpServer.listen(PORT, async () => {
  console.log(`Express server application is running on port: ${PORT}\n\n`.yellow.bold.underline);

  try {
    // Call the newMessageNotificationEmail function at the scheduled time
    await newMessageNotificationEmail();
  } catch (error) {
    console.error('Error scheduling email notification job:', error.message);
  }
});
