import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GroupChat = new Schema(
  {
    groupName: { type: String },
    groupDescription: { type: String, default: 'Group' },
    groupPhoto: {
      type: String,
    },
    participants: [
      {
        userInfo: { type: mongoose.Types.ObjectId, ref: 'User' },
        isAdmin: { type: Boolean, default: false, required: true },
        hasUnreadMessage: { type: Boolean, default: false },
      },
    ],
    creator: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    typingUsers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    messages: [
      {
        text: { type: String },
        sender: { type: mongoose.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        isBotMessage: { type: Boolean, default: false },
        status: {
          type: String,
          enum: ['sent', 'read', 'failed'],
          default: 'sent',
        },
      },
    ],
    media: [{ type: mongoose.Types.ObjectId, ref: 'Media' }],
    lastActive: { type: Date, default: Date.now },
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      isBotMessage: { type: Boolean, default: false },
    },
    chatType: { type: String, default: 'group', immutable: true },
    isTeamChat: { type: Boolean, default: false },
  },
  { timestamps: true },
);

GroupChat.pre('save', function (next) {
  this.lastActive = new Date();
  next();
});

GroupChat.index({ groupName: 1, 'participants._id': 1 }, { unique: true });

export default mongoose.model('GroupChat', GroupChat, 'groupchats');
