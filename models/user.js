import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const User = new Schema(
  {
    bio: { type: String, maxlength: 300 },
    declinedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    email: {
      match: /.+\@.+\..+/,
      type: String,
      required: true,
      unique: [true, "E-mail already exists."],
    },
    firstName: { type: String, required: true },
    interestedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    lastName: { type: String, required: true },
    linkedinUrl: { type: String },
    memberOfProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    notifications: [{ type: Schema.Types.ObjectId, ref: 'pushNotifications' }],
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

// const pushNotifications = new Schema({
//   user: { type: Schema.Types.ObjectId, ref: 'User' },
//   notification: { type: String },
//   message: { type: String },
//   read: { type: Boolean },
// });

// const pushNotification = mongoose.model('pushNotifications', pushNotifications);
// const User = mongoose.model('User', userSchema);

// export { User, pushNotification };
