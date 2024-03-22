import { Server } from 'socket.io';
import User from './models/user.js';
import { getReceiverParticipants, markMessagesAsRead } from './controllers/chat/thread.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      transports: ['websocket'],
      origin: process.env.BASE_URL,
      credentials: true,
    },
  });

  getSocketEvents(io);

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  console.log(io);
  return io;
};

const getSocketEvents = (io) => {
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('setUserId', async (userId) => {
      if (userId) {
        const oneUser = await User.findById(userId).lean().exec();
        if (oneUser) {
          socket.join(userId.toString());
          // console.log(`Socket: User with id ${userId} has connected.`.cyan.bold.underline);
        } else {
          console.log(`No user with id ${userId}`);
        }
      }
    });

    socket.on('reconnect', () => {
      console.log(`User reconnected: ${socket.id}`);
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
        participantIds.forEach((participantId) => {
          io.to(participantId.toString()).emit('new-message-received', receivedMessage);
        });
      } catch (error) {
        console.error('Error in socket send message: ', error);
      }
    });

    socket.on('create-new-room', async (chatRoomInfo) => {
      try {
        const { chatRoom, receiverIds } = chatRoomInfo;
        receiverIds.forEach((receiverId) => {
          io.to(receiverId).emit('new-room-created', chatRoom);
        });
      } catch (error) {
        console.error('Error in socket send message: ', error);
      }
    });

    socket.on('mark-message-as-read', async (chatInfo) => {
      const { chatRoomId, chatType, activeUserId } = chatInfo;
      try {
        await markMessagesAsRead(chatRoomId, chatType, activeUserId);
        io.to(activeUserId).emit('message-read', { chatRoomId, activeUserId });
      } catch (error) {
        console.error('Error in socket mark as read: ', error);
      }
    });
  });
};
