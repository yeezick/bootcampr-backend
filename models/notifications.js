import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const pushNotifications = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  notification: { type: String },
  message: { type: String },
  read: { type: Boolean },
});

export default mongoose.model('pushNotifications', pushNotifications);
