import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const roleSchema = {
  interestedApplicants: {
    design: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    engineering: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  status: { type: String, enum: ['Draft', 'Published'] },
  title: { type: String },
  description: { type: String, maxlength: 300 },
  skills: [{ type: String }],
  maxHeadCount: { type: Number },
};
