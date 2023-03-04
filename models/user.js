import mongoose from 'mongoose';
import { defaultAvailability } from '../utils/availability';
const Schema = mongoose.Schema;

// Backend Model Refactor
// NOTES:
// TODO: clean up backend routes (and anywhere else affected)
//  - Users cannot delete boards, calendars or projects
//  - Add a route to see team member's availability

// QUESTIONS:
//  - are chats limited to a project (full team only)? or can a user have unique chats outside of a project

const User = new Schema(
    {
        bio: { type: String, maxlength: 300 },
        email: {
            match: /.+\@.+\..+/,
            type: String,
            required: true,
            unique: [ true, 'E-mail already exists.'],
        },
        firstName: { type: String, required: true },
        githubUrl: { type: String },
        lastName: { type: String, required: true },
        linkedinUrl: { type: String },
        passwordDigest: { type: String, required: true, select: false },
        portfolioProjects: [{ type: Object }],
        portfolioUrl: { type: String },
        profilePicture: { type: String },
        role: { type: String, enum: ['Software Engineer', 'UX Designer'] },
        verified: { type: Boolean, default: false },
        // additions
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
        // If there is a singular chat 'room' / 'thread' for a project, then this can just live on the Project, not User
        // If eventually we allow user to user private chats, can live on user
        // chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
        // Since meetings will be attached to a Project, this also doesn't need to live on the User
        // They'll see meetings on their Project calendar
        // meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
        // we may not actually need to store timezone, we can probably get it dynamically with
        // ... JS .getTimezoneOffset() and store all times in UTC
        // store availability in UTC, handle translation on frontend rendering
        // store as stringified object, workable with JSON.parse()
        availability: {
            sunday: { type: String, default: JSON.stringify(defaultAvailability) },
            monday: { type: String, default: JSON.stringify(defaultAvailability) },
            tuesday: { type: String, default: JSON.stringify(defaultAvailability) },
            wednesday: { type: String, default: JSON.stringify(defaultAvailability) },
            thursday: { type: String, default: JSON.stringify(defaultAvailability) },
            friday: { type: String, default: JSON.stringify(defaultAvailability) },
            saturday: { type: String, default: JSON.stringify(defaultAvailability) }, 
        }
    },
    { timestamps: true},
);

export default mongoose.model('User', User);