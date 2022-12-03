import mongoose from 'mongoose';
const Schema = mongoose.Schema;
/**
 * TODO:
 * - Concert snake_case properties to camelCase
 *
 * Need to discuss:
 * - options for meeting cadence
 * - is duration necessary? what are the possible options?
 * - how we will handle multiple roles
 * - how we handle applicants to a role
 * -
 */
const roleSchema = {
  interestedApplicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Draft', 'Published'] },
  title: { type: String },
  description: { type: String, maxlength: 300 },
  skills: [{ type: String }],
  maxHeadcount: { type: Number },
};

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
  },
  { timestamps: true },
);
export default mongoose.model('Project', Project);
