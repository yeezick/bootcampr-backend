import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const privateChat = new Schema(
  {
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
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
        readBy: [
          {
            user: { type: mongoose.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now },
          },
        ],
      },
    ],
    media: [{ type: mongoose.Types.ObjectId, ref: 'Media' }],
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

privateChat.pre('save', function (next) {
  if (this.participants.length !== 2) {
    const error = new Error('A private chat must have exactly 2 participants.');
    next(error);
  } else {
    this.lastActive = new Date();
    next();
  }
});

privateChat.index({ participants: 1 });

export default mongoose.model('PrivateChat', privateChat);
