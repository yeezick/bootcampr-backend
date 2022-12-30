import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';
import * as io from 'socket.io';
import { notificationSocket } from './utils/socketio.js';
import { createServer } from 'http';
// import project from './models/project.js';

const app = express();
const PORT = process.env.PORT || 8001;

const server = createServer(app);
const socketio = new io.Server(server, db, {
  transports: ['polling'],
  cors: {
    origin: '*',
    credentials: true,
  },
  notificationSocket,
});
app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);

// project.watch().on('change', () => {
//   console.log('New Project Added');
//   socketio.emit('changes', 'New Project');
// });

socketio.on('connected', (socket) => {
  console.log(socket.id + 'socket connected');
  socket.on('disconnect', () => {
    socket.disconnect();
    console.log('socket disconnected');
  });
});

// server.listen(PORT, () => {
//   console.log(`Express server application is running on port: ${PORT}\n\n`);
// });

db.on('connected', () => {
  console.log('Connected to MongoDB!');
  server.listen(PORT, () => {
    console.log(`Express server application is running on port: ${PORT}\n\n`);
  });
});
