import mongoose from 'mongoose';
import { roleSchema } from '../utils/schemas.js';
const Schema = mongoose.Schema;

const Project = new Schema(
    {
        overview: { type: String, required: true },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        title: { type: String, required: true, maxlength: 45 },
        tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
        meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
        chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }]
        },
    { timestamps: true },
);
export default mongoose.model('Project', Project);