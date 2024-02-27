import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Project = new Schema(
  {
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    calendarId: { type: String },
    // Add regex or some type check on the date format?
    goal: { type: String, required: true },
    meetings: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
    members: {
      engineers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      designers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      productManagers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    },
    problem: { type: String, required: true },
    timeline: {
      startDate: { type: String },
      endDate: { type: String },
    },
    title: { type: String, required: true, maxLength: 45 },
    loading: { type: Boolean },
    projectTracker: {
      toDo: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
      inProgress: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
      underReview: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
      completed: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
    },
    completedInfo: {
      presenting: {
        type: Boolean,
        default: null,
      },
      deployedUrl: {
        type: String,
      },
    },
  },
  { timestamps: true },
);
export default mongoose.model('Project', Project);
