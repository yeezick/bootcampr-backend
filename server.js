import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';
import * as io from 'socket.io';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);
const server = createServer(app);
const socketio = new io.Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

// socketio.on(
//   'connection',
//   (socket) => {
//     var clientIp = socket.request.socket.remoteAddress;

//     console.log(clientIp);
//   },
//   console.log(`Server is running on Port ${PORT}`),
// );

// server.listen(PORT);

db.on('connected', () => {
  console.log('Connected to MongoDB!');
  app.listen(PORT, () => {
    console.log(`Express server application is running on port: ${PORT}\n\n`);
  });
});
