import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    content: { type: String },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    isReply: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Comment', Comment);
