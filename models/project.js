import mongoose from 'mongoose';
import { roleSchema } from '../utils/schemas.js';
const Schema = mongoose.Schema;

const Project = new Schema(
  {
    duration: { type: String },
    meetingCadence: { type: Number, max: 6, required: true },
    overview: { type: String, required: true },
    projectOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roles: {
      engineering: [roleSchema],
      design: [roleSchema],
    },
    status: { type: String, required: true, enum: ['Draft', 'Published'] },
    tools: [{ type: String, required: true }], //todo: add ability to categorize tools (SWE/UX)
    title: { type: String, required: true, maxlength: 45 },
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
