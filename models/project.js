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

const Project = new Schema(
  {
    duration: { type: String },
    meetingCadence: { type: String, required: true },
    overview: { type: String, required: true },
    projectOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roles: [
      {
        interestedApplicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        status: { type: String, enum: ['Draft', 'Published'] },
        category: { type: String, enum: ['Software Engineer', 'UX Designer'] },
        title: { type: String },
        description: { type: String, maxlength: 300 },
        skills: [{ type: String }],
        desiredHeadcount: { type: Number },
      },
    ],
    status: { type: String, required: true, enum: ['Draft', 'Published'] },
    technologiesUsed: [{ type: String, required: true }],
    title: { type: String, required: true, maxlength: 45 },
  },
  { timestamps: true },
);
export default mongoose.model('Project', Project);
