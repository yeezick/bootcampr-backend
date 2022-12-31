import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Role = {
  interestedApplicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Draft', 'Published'] },
  title: { type: String },
  description: { type: String, maxlength: 300 },
  skills: [{ type: String }],
  maxHeadCount: { type: Number },
};

export default mongoose.model('Role', roleSchema);
