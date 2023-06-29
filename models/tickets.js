import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Ticket = new Schema(
  {
    title: { type: String },
    description: { type: String },
    link: { type: String },
    status: { type: String, enum: ['toDo', 'inProgress', 'underReview', 'completed'] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignees: { type: Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    dueDate: { type: String },
    projectId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model('Ticket', Ticket);