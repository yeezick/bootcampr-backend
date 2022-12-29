import User from '../models/user.js';
import pushNotifications from '../models/notifications.js';

let currentUser = [];

module.exports = function (io) {
  io.on('connection', (socket) => {
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
    });
    socket.on('getNotificationsLength', async (userId) => {
      const notifications = await pushNotifications.find({ user: userId, read: false }).lean();
      currentUser[userId]?.emit('notificationsLength', notifications.length || 0);
    });
    socket.on('disconnect', (userId) => {
      console.log(`User with id ${userId} has disconnected.`);
      currentUser[userId] = null;
    });
  });
};
