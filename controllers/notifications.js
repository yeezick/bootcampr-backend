import pushNotifications from '../models/notifications.js';

export const getAllNotifications = async (req, res) => {
  try {
    const { user } = req.body;
    const filterUsers = pushNotifications.find({ userId: user });
    const total = await filterUsers.countDocuments();
    const notifications = await pushNotifications.find({ userId: user });
    if (!notifications) {
      return res.status(400).json({ message: 'Notifications are empty' });
    }
    res.json({ notifications, totalNotificationCount: total });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
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
  try {
    const { _id } = req.body;
    const updateNotification = await pushNotifications.findById(_id).exec();
    updateNotification.read = true;
    const result = await updateNotification.save();
    if (!result) {
      return res.status(400).json({ status: false, message: 'No notifications found' });
    }
    res.json({ status: true, message: `Notification was marked as read` });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { user } = req.body;

    if (!user || !user.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: false, message: `User: ${user} was not found` });
    }
    const notificationsUpdateMany = await pushNotifications.updateMany({ user: user }, { $set: { read: true } });
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
    const { _id } = req.body;

    const deleteNotification = await pushNotifications.findById(_id).exec();
    if (!deleteNotification) {
      return res.status(400).json({ status: false, message: `Error finding a notification with id: ${_id}` });
    }
    const result = await deleteNotification.deleteOne();
    if (!result) {
      return res.status(400).json({ status: false, message: `Cannot delete notification with id: ${_id}` });
    }
    res.json({ status: true, message: 'Notification was successfully deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const { user } = req.body;

    if (!user || !user.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: false, message: `User: ${user} was not found` });
    }
    const notificationsDeleteMany = await pushNotifications.deleteMany({ user: user });
    if (!notificationsDeleteMany) {
      return res.status(400).json({ status: false, message: 'Error Deleting all notifications' });
    }
    res.json({ status: true, message: 'All notifications for user has been deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};
