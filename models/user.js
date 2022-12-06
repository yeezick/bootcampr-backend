import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const notificationSchema = {
  notification: { type: String },
  message: { type: String },
  read: { type: Boolean },
};

const User = new Schema(
  {
    bio: { type: String, maxlength: 300 },
    declinedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    email: {
      // match: /.+\@.+\..+/,
      type: String,
      required: true,
      // unique: [true, "E-mail already exists."],
    },
    firstName: { type: String, required: true },
    interestedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    lastName: { type: String, required: true },
    linkedinUrl: { type: String },
    memberOfProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    notifications: [notificationSchema],
    ownerOfProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    passwordDigest: { type: String, required: true, select: false },
    portfolioProjects: [{ type: Object }],
    portfolioUrl: { type: String },
    profilePicture: { type: String },
    role: { type: String },
    savedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
);

export default mongoose.model('User', User);
