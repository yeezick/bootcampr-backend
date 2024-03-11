import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PrivateChat = new Schema(
  {
    participants: [
      {
        userInfo: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
        },
        hasUnreadMessage: { type: Boolean, default: false },
      },
    ],
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
    chatType: { type: String, default: 'private', immutable: true },
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

PrivateChat.pre('save', function (next) {
  if (this.participants.length !== 2) {
    const error = new Error('A private chat must have exactly 2 participants.');
    next(error);
  } else {
    this.lastActive = new Date();
    next();
  }
});

PrivateChat.index({ participants: 1 });

export default mongoose.model('PrivateChat', PrivateChat, 'privatechats');
