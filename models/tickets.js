import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Ticket = new Schema(
  {
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String },
    dueDate: { type: String },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String },
    link: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    status: { type: String, enum: ['toDo', 'inProgress', 'underReview', 'completed'], required: true },
    title: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('Ticket', Ticket);
