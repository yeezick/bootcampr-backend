import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Task = new Schema(
    {
        title: { type: String },
        description: { type: String },
        status: { type: String, enum: ['to-do', 'in progress', 'in-review', 'completed', 'archived'], default: 'to-do' },
        assignee: { type: Schema.Types.ObjectId, ref: 'User' },
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
    },
    { timestamps: true }
);

export default mongoose.model("tasks", Task);