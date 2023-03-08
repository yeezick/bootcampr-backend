import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { startTimeOptions } from "../utils/availability";

const Meeting = new Schema(
    {
        attendees: [{
            member: { type: Schema.Types.ObjectId, ref: 'User' },
            confirmed: { type: Boolean, required: true, default: false }
        }],
        description: { type: String },
        duration: { type: Number, enum: [30, 60, 90] },
        // if meeting ids live on project, this isn't necessary
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
        recurring: { type: null || String, enum: ['mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays', 'sundays']},
        startTime: { type: String, enum: startTimeOptions },
        title: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("meetings", Meeting);