import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const pushNotifications = new Schema(
  {
    user: { type: String },
    title: { type: String },
    type: { type: Number },
    message: { type: String },
    read: { type: Boolean },
  },
  { timestamps: true },
);

export default mongoose.model('pushNotifications', pushNotifications);
