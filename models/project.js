import mongoose from 'mongoose';
import { roleSchema } from '../utils/schemas.js';
const Schema = mongoose.Schema;
/**
 * Need to discuss:
 * - options for meeting cadence
 * - is duration necessary? what are the possible options?
 */

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
      toDo: [{ type: Schema.Types.ObjectId, ref: 'Ticket', required: true }],
      inProgress: [{ type: Schema.Types.ObjectId, ref: 'Ticket', required: true }],
      underReview: [{ type: Schema.Types.ObjectId, ref: 'Ticket', required: true }],
      completed: [{ type: Schema.Types.ObjectId, ref: 'Ticket', required: true }],
    },
  },
  { timestamps: true },
);
export default mongoose.model('Project', Project);
