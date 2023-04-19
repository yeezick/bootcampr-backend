import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Ticket = new Schema(
  {
    title: { type: String },
    status: { type: String, enum: ['To Do', 'In Progress', 'Under Review', 'Completed'] },
    description: { type: String },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    image: { type: String },
    projectId: { type: String },
  },
  { timestamps: true },
);
export default mongoose.model('Ticket', Ticket);
