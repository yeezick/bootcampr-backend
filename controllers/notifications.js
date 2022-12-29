import pushNotifications from '../models/notifications.js';

export const getAllNotifications = async (req, res) => {
  const { id } = req.body;
  const filterUsers = pushNotifications.find({ user: id });
  const total = await filterUsers.countDocuments();
  const notifications = await pushNotifications.find({ user: id });
  if (!notifications) {
    return res.status(400).json({ message: 'Notifications are empty' });
  }
  res.json(notifications);
};

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.body;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }
  const updateNotification = await notification.find({ id }).exec();
  if (!updateNotification) {
    return res.status(400).json({ message: 'No notifications found' });
  }
  updateNotification.read = false;
  await updateNotification.save();
  res.json(updateNotification);
};
