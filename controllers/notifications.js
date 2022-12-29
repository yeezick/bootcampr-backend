import pushNotifications from '../models/notifications.js';

export const getAllNotifications = async (req, res) => {
  try {
    const { user } = req.body;
    console.log(req.body.user);
    const filterUsers = pushNotifications.find({ userId: user });
    const total = await filterUsers.countDocuments();
    const notifications = await pushNotifications.find({ userId: user });
    console.log(total);
    if (!notifications) {
      return res.status(400).json({ message: 'Notifications are empty' });
    }
    res.json(notifications);
  } catch (error) {
    console.log(error);
  }
};

export const saveNotification = async (req, res) => {
  try {
    const newNotification = new pushNotifications(req.body);
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { user } = req.body;
  //   console.log(req.body);
  const id = user;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }
  const updateNotification = await pushNotifications.find({ id }).exec();
  if (!updateNotification) {
    return res.status(400).json({ message: 'No notifications found' });
  }
  console.log(updateNotification);
  updateNotification.read = false;
  //   await updateNotification.save();
  res.json(updateNotification);
};

export const markAllNotificationsAsRead = async (req, res) => {
  const { user } = req.body;
  const id = user;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }
  const notificationsUpdateMany = await pushNotifications.updateMany({ user: id }, { $set: { read: true } });
  if (!notificationsUpdateMany) {
    return res.status(400).json({ message: 'Error Marking all notifications as read' });
  }
  res.json({ message: `All notifications for user ${id} marked as read` });
};
