import PushNotifications from '../models/notifications.js';
const userRegex = /^[0-9a-fA-F]{24}$/;

export const getAllNotifications = async (req, res) => {
  try {
    const { user } = req.body;
    const notifications = await PushNotifications.find({ userId: user });
    if (!notifications) {
      return res.status(204).json({ message: 'Notifications are empty' });
    }
    res.json(notifications);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const saveNotification = async (req, res) => {
  try {
    const newNotification = new PushNotifications(req.body);
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { _id: userId } = req.body;
    const updateNotification = await PushNotifications.findByIdAndUpdate(userId).exec();
    updateNotification.read = true;
    const result = await updateNotification.save();
    if (!result) {
      return res.status(204).json({ status: false, message: 'No notifications found' });
    }
    res.json({ status: true, message: `Notification was marked as read` });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { user } = req.params;

    if (!user || !user.match(userRegex)) {
      return res.status(204).json({ status: false, message: `User: ${user} was not found` });
    }
    const notificationsUpdateMany = await PushNotifications.updateMany({ user: user }, { $set: { read: true } });
    if (!notificationsUpdateMany) {
      return res.status(400).json({ status: false, message: 'Error marking all notifications as read' });
    }
    res.json({ status: true, message: `All notifications for user ${user} marked as read` });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { _id: userId } = req.params;

    const deleteNotification = await PushNotifications.findById(userId).exec();
    if (!deleteNotification) {
      return res.status(204).json({ status: false, message: `Error finding a notification with id: ${userId}` });
    }
    const result = await deleteNotification.deleteOne();
    if (!result) {
      return res.status(400).json({ status: false, message: `Cannot delete notification with id: ${userId}` });
    }
    res.json({ status: true, message: 'Notification was successfully deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const { user } = req.params;

    if (!user || !user.match(userRegex)) {
      return res.status(204).json({ status: false, message: `User: ${user} was not found` });
    }
    const notificationsDeleteMany = await PushNotifications.deleteMany({ user: user });
    if (!notificationsDeleteMany) {
      return res.status(400).json({ status: false, message: 'Error Deleting all notifications' });
    }
    res.json({ status: true, message: 'All notifications for user has been deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};
