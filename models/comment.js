import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Comment = new Schema(
    {
        likes: [{ type: Schema.Types.ObjectId, ref: 'User'}],
        content: { type: String },
        author: { type: {
            userId: { type: Schema.Types.ObjectId, ref: 'User'},
            firstName: { type: String },
            lastName: { type: String },
            profilePicture: { type: String },
        }, required: true},
        replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        isReply: { type: Boolean, default: false }
    },
    { timestamps: true },
);

export default mongoose.model('Comment', Comment);