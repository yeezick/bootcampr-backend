import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Event = new Schema(
  {
    title: { type: String, required: true },
    start: { type: String },
    end: { type: String },
    calendarId: { type: String },
    classNames: [],
    description: { type: String }
  }
)

export default mongoose.model('Event', Event);