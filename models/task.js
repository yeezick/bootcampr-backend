import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Task = new Schema(
    {
        assignee: { type: Schema.Types.ObjectId, ref: 'User' },
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        criteria: [{ type: String }],
        description: { type: String },
        priority: { type: String, enum: ['Urgent', 'High', 'Normal', 'Low'], default: 'Low'},
        // If tasks live on a project, this isn't needed
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
        // NOTE: If we allow users to create their own column names, this enum needs adjustment
        status: { type: String, enum: ['to-do', 'in progress', 'blocked', 'completed', 'archived'], default: 'to-do' },
        type: { type: String, enum: ['bug', 'story', 'spike'] },
        title: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("tasks", Task);