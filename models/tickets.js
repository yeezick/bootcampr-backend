import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Ticket = new Schema(
  {
    title: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    description: { type: String },
    link: { type: String },
    status: { type: String, enum: ['toDo', 'inProgress', 'underReview', 'completed'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    dueDate: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  },
  { timestamps: true },
);

export default mongoose.model('Ticket', Ticket);
