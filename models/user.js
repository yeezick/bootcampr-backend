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
      SUN: {
        available: { type: Boolean },
        availability: [[String]],
      },
      MON: {
        available: { type: Boolean },
        availability: [[String]],
      },
      TUE: {
        available: { type: Boolean },
        availability: [[String]],
      },
      WED: {
        available: { type: Boolean },
        availability: [[String]],
      },
      THU: {
        available: { type: Boolean },
        availability: [[String]],
      },
      FRI: {
        available: { type: Boolean },
        availability: [[String]],
      },
      SAT: {
        available: { type: Boolean },
        availability: [[String]],
      },
    },
    bio: { type: String, maxlength: 500 },
    email: {
      match: /.+\@.+\..+/,
      type: String,
      required: true,
      unique: [true, 'E-mail already exists.'],
    },
    emailPreferences: {
      type: Object,
      required: true,
      default: {
        bootcamprUpdates: true,
        newsletters: true,
        projectUpdates: true,
        eventInvitations: true,
        surveysAndFeedback: true,
        chatNotifications: true,
        jobAlerts: true,
      },
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    links: {
      githubUrl: { type: String },
      linkedinUrl: { type: String },
      portfolioUrl: { type: String },
    },
    onboarded: { type: Boolean, default: false },
    passwordDigest: { type: String, required: true, select: false },
    profilePicture: { type: String },
    defaultProfilePicture: { type: String }, // should be deleted
    hasProfilePicture: { type: Boolean }, // should be deleted -- both of these properties can be consolidated with just "profilePicture"
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    projects: {
      activeProject: { type: Schema.Types.ObjectId, ref: 'Project' },
      projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    },
    payment: {
      experience: { type: String, default: 'unchosen', enum: ['active', 'sandbox', 'unchosen', 'waitlist'] },
      paid: { type: Boolean, required: true, default: false },
    },
    role: { type: String, enum: ['Software Engineer', 'UX Designer', 'Product Manager'] },
    timezone: { type: String },
    unreadMessages: { type: Map, of: Boolean, default: {} },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('User', User);
