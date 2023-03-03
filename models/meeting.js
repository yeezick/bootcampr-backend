import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { startTimeOptions } from "../utils/availability";

const Meeting = new Schema(
    {
        attendees: [{
            member: { type: Schema.Types.ObjectId, ref: 'User' },
            confirmed: { type: Boolean }
        }],
        startTime: { type: String, enum: startTimeOptions },
        duration: { type: Number, enum: [30, 60, 90] },
        project: { type: Schema.Types.ObjectId, ref: 'Project' },
    },
    { timestamps: true }
);

export default mongoose.model("meetings", Meeting);