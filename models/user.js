import mongoose from 'mongoose';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// const User = new Schema(
const user = new Schema(
  {
    bio: { type: String, maxlength: 300 },
    declinedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    email: {
      match: /.+\@.+\..+/,
      type: String,
      required: true,
      unique: [true, 'E-mail already exists.'],
    },
    firstName: { type: String, required: true },
    interestedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    lastName: { type: String, required: true },
    linkedinUrl: { type: String },
    memberOfProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    ownerOfProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    passwordDigest: { type: String, required: true, select: false },
    portfolioProjects: [{ type: Object }],
    portfolioUrl: { type: String },
    profilePicture: { type: String },
    role: { type: String, enum: ['Software Engineer', 'UX Designer'] },
    savedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export default mongoose.model('User', User);
