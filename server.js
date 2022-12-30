import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';
import * as io from 'socket.io';
import { createServer } from 'http';
import pushNotifications from './models/notifications.js';
import User from './models/user.js';

const app = express();
const PORT = process.env.PORT || 8001;

const server = createServer(app);
const socketio = new io.Server(server, db, {
  cors: {
    transports: ['polling'],
    origin: '*',
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);

let currentUser = [];

socketio.on('connection', (socket) => {
  socket.on('setUserId', async (userId) => {
    if (userId) {
      const oneUser = await User.findById(userId).lean().exec();
      if (oneUser) {
        currentUser[userId] = socket;
        console.log(`Socket: User with id ${userId} has connected.`);
      } else {
        console.log(`No user with id ${userId}`);
      }
    }
    pushNotifications.watch().on('change', async () => {
      const notifications = await pushNotifications.find({ user: userId, read: false }).lean();
      currentUser[userId]?.emit('notificationsLength', notifications.length || 0);
    });
    socket.off('disconnect', (userId) => {
      console.log(`User with id ${userId}, has disconnected.`);
      currentUser[userId] = null;
    });
  });
});

server.listen(PORT, () => {
  console.log(`Express server application is running on port: ${PORT}\n\n`);
});
