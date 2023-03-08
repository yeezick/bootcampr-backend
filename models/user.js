import mongoose from 'mongoose';
import { defaultSingleDayAvailability } from '../utils/availability.js';
const Schema = mongoose.Schema;

// Backend Model Refactor
// NOTES:
// TODO: clean up backend routes (and anywhere else affected)
//  - Users cannot delete boards, calendars or projects
//  - Add a route to see team member's availability

const User = new Schema(
  {
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
    passwordDigest: { type: String, required: true, select: false },
    profilePicture: { type: String },
    role: { type: String, enum: ['Software Engineer', 'UX Designer'] },
    verified: { type: Boolean, default: false },
    // additions
    project: { type: Schema.Types.ObjectId, ref: 'Project' },

    // TODO: Discuss with UX
    // CHAT
    // If there is a singular chat 'room' / 'thread' for a project, then this can just live on the Project, not User
    // If eventually we allow user to user private chats, can live on user
    // chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    // Since meetings will be attached to a Project, this also doesn't need to live on the User

    // CALENDAR
    // They'll see meetings on their Project calendar
    // meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
    // we may not actually need to store timezone, we can probably get it dynamically with
    // ... JS .getTimezoneOffset() and store all times in UTC
    // store availability in UTC, handle translation on frontend rendering
    // store as stringified object, workable with JSON.parse()
    availability: {
      sunday: { type: String, default: JSON.stringify(defaultSingleDayAvailability) },
      monday: { type: String, default: JSON.stringify(defaultSingleDayAvailability) },
      tuesday: { type: String, default: JSON.stringify(defaultSingleDayAvailability) },
      wednesday: { type: String, default: JSON.stringify(defaultSingleDayAvailability) },
      thursday: { type: String, default: JSON.stringify(defaultSingleDayAvailability) },
      friday: { type: String, default: JSON.stringify(defaultSingleDayAvailability) },
      saturday: { type: String, default: JSON.stringify(defaultSingleDayAvailability) },
    },
  },
  { timestamps: true },
);

export default mongoose.model('User', User);
