import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Project = new Schema(
  {
    description: { type: String, required: true, maxlength: 300 },
    designer_count: {type: Number },
    engineer_count: {type: Number},
    interested_applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seeking: { type: Boolean, required: true },
    time_commitment: {type: String, enum: ["no preference", "hobby", "part-time", "full-time"]},
    team_members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    title: { type: String, required: true, maxlength: 45 },
    tools: [{ type: Schema.Types.ObjectId, ref: 'Tool'}],
  },
  { timestamps: true }
);

export default mongoose.model("projects", Project);
