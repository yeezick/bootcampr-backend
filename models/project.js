import mongoose from 'mongoose';
const Schema = mongoose.Schema;
/**
 * Need to discuss:
 * - options for meeting cadence
 * - is duration necessary? what are the possible options?
 */
const Project = new Schema(
  {
    duration: { type: String },
    meeting_cadence: { type: String, required: true },
    overview: { type: String, required: true },
    project_owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true, enum: ['Draft', 'Published'] },
    technologies_used: [{ type: String, required: true }],
    title: { type: String, required: true, maxlength: 45 },
  },
  { timestamps: true },
);
export default mongoose.model('Project', Project);
