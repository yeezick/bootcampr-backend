import mongoose from 'mongoose';
import { roleSchema } from '../utils/schemas.js';
const Schema = mongoose.Schema;

const Project = new Schema(
  {
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    // Add regex or some type check on the date format?
    goal: { type: String, required: true },
    meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
    members: {
      engineers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      designers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    problem: { type: String, required: true },
    // Since each tasks holds 'status' info, is it really needed here as well?
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    timeline: {
      startDate: { type: String },
      endDate: { type: String },
    },
    title: { type: String, required: true, maxLength: 45 },
    projectTracker: {
      toDo: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
      inProgress: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
      underReview: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
      completed: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
    },
  },
  { timestamps: true },
);

export default mongoose.model('Project', Project);
