import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GroupChat = new Schema(
  {
    groupName: { type: String },
    groupDescription: { type: String, default: 'Group' },
    groupPhoto: {
      type: String,
      default: 'https://i.postimg.cc/L8jC1rSp/default-group-avatar.png',
    },
    participants: [
      {
        participant: { type: mongoose.Types.ObjectId, ref: 'User' },
        isAdmin: { type: Boolean, default: false, required: true },
      },
    ],
    creator: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    typingUsers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    messages: [
      {
        text: { type: String },
        sender: { type: mongoose.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['sent', 'read', 'failed'],
          default: 'sent',
        },
      },
    ],
    media: [{ type: mongoose.Types.ObjectId, ref: 'Media' }],
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

GroupChat.pre('save', function (next) {
  this.lastActive = new Date();
  next();
});

GroupChat.index({ groupName: 1, 'participants._id': 1 }, { unique: true });

export default mongoose.model('GroupChat', GroupChat);
