import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Backend Model Refactor
// NOTES:
// TODO: clean up backend routes (and anywhere else affected)
//  - Users cannot delete boards, calendars or projects
//  - Add a route to see team member's availability

const User = new Schema(
  {
    availability: {
      sunday: { type: String },
      monday: { type: String },
      tuesday: { type: String },
      wednesday: { type: String },
      thursday: { type: String },
      friday: { type: String },
      saturday: { type: String },
    },
    bio: { type: String, maxlength: 300 },
    email: {
      match: /.+\@.+\..+/,
      type: String,
      required: true,
      unique: [true, 'E-mail already exists.'],
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    links: {
      githubUrl: { type: String },
      linkedinUrl: { type: String },
      portfolioUrl: { type: String },
    },
    onboarded: { type: Boolean },
    passwordDigest: { type: String, required: true, select: false },
    profilePicture: { type: String },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    role: { type: String, enum: ['Software Engineer', 'UX Designer'] },
    timezone: { type: String },
    verified: { type: Boolean, default: false },

    // CALENDAR
    // They'll see meetings on their Project calendar
    // meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
    // we may not actually need to store timezone, we can probably get it dynamically with
    /// *** we should still store a user's timezone on their user object
    // ... JS .getTimezoneOffset() and store all times in UTC
    // store availability in UTC, handle translation on frontend rendering
    // store as stringified object, workable with JSON.parse()
  },
  { timestamps: true },
);

export default mongoose.model('User', User);
