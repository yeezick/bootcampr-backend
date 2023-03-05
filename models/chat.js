import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Resembles a message more than a chat
// To be refactored by Jason
const Chat = new Schema(
    {
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        message: { type: String },
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
    },
    { timestamps: true }
);

export default mongoose.model("chats", Chat);