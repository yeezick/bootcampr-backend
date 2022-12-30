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
  const { _id } = req.body;
  const id = _id;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }
  const updateNotification = await pushNotifications.findById(id).exec();
  updateNotification.read = true;
  const result = await updateNotification.save();
  if (!result) {
    return res.status(400).json({ message: 'No notifications found' });
  }

  res.json({ message: `Notification marked as read` });
};

export const markAllNotificationsAsRead = async (req, res) => {
  const { user } = req.body;

  if (!user || !user.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${user}` });
  }
  const notificationsUpdateMany = await pushNotifications.updateMany({ user: user }, { $set: { read: true } });
  if (!notificationsUpdateMany) {
    return res.status(400).json({ message: 'Error Marking all notifications as read' });
  }
  res.json({ message: `All notifications for user ${user} marked as read` });
};

export const deleteNotification = async (req, res) => {
  const { _id } = req.body;
  const id = _id;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }

  const deleteNotification = await pushNotifications.findById(id).exec();
  if (!deleteNotification) {
    return res.status(400).json({ message: `Can't find a notification with id: ${id}` });
  }
  const result = await deleteNotification.deleteOne();
  if (!result) {
    return res.status(400).json({ message: `Can't delete the notification with id: ${id}` });
  }
  res.json({ message: `Notification with id: ${id} deleted with success` });
};

export const deleteAllNotifications = async (req, res) => {
  const { user } = req.body;
  const id = user;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: `You must give a valid id: ${id}` });
  }
  const notificationsDeleteMany = await pushNotifications.deleteMany({ user: id });
  if (!notificationsDeleteMany) {
    return res.status(400).json({ message: 'Error Deleting all notifications as read' });
  }
  res.json({ message: `All notifications for user ${id}marked was deleted` });
};
