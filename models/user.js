import mongoose from "mongoose";
const Schema = mongoose.Schema;

const User = new Schema(
  {
    bio: { type: String, maxlength: 300 },
    email: {
      // match: /.+\@.+\..+/,
      type: String,
      required: true,
      // unique: [true, "E-mail already exists."],
    },
    firstName: { type: String, required: true },
    interestedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    lastName: { type: String, required: true },
    linkedinUrl: { type: String },
    memberOfProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    ownerOfProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    passwordDigest: { type: String, required: true, select: false },
    profilePicture: {type: String},
    portfolioProjects: [{ type: Object }],
    portfolioUrl: { type: String },
    declinedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    role: { type: String },
    savedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);
export default mongoose.model("User", User);
