import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Project = new Schema(
  {
    status: { type: String, required: true, enum: ["Draft", "Published"] },
    title: { type: String, required: true, maxlength: 45 },
    project_owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    overview: { type: String, required: true },
    meeting_cadence: { type: String, required: true },
    technologies_used: [{ type: String, required: true }],
    roles: [
      {
        interested_applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
        status: { type: String, enum: ["Draft", "Published"] },
        category: { type: String, enum: ["Software Engineer", "UX Designer"] },
        title: { type: String },
        description: { type: String, maxlength: 300 },
        skills: [{ type: String }],
        desired_headcount: { type: Number },
      },
    ],

    duration: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("projects", Project);
