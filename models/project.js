import mongoose from "mongoose";
const Schema = mongoose.Schema;
/**
 * TODO:
 * - Concert snake_case properties to camelCase
 * 
 * Need to discuss:
 * - options for meeting cadence
 * - is duration necessary?
 * - how we will handle multiple roles
 * - how we handle applicants to a role
 * -
 */

const Project = new Schema(
  {
    duration: { type: String },
    meeting_cadence: { type: String, required: true },
    overview: { type: String, required: true },
    project_owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    status: { type: String, required: true, enum: ["Draft", "Published"] },
    technologies_used: [{ type: String, required: true }],
    title: { type: String, required: true, maxlength: 45 },
  },
  { timestamps: true }
);
export default mongoose.model("Project", Project);
