import mongoose from "mongoose";
const Schema = mongoose.Schema;

const User = new Schema(
  {
    bio: { type: String, maxlength: 300 },
    declinedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    email: {
      // match: /.+\@.+\..+/,
      type: String,
      required: true,
      // unique: [true, "E-mail already exists."],
    },
    firstName: { type: String, required: true },
    appliedToProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    lastName: { type: String, required: true },
    // if user will be allowed to add multiple links to profile, each with a name and url, linkedin and portfolio URL can just be a part of this list, but we'll handle the name value
    linkedinUrl: { type: String },
    memberOfProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    ownerOfProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    passwordDigest: { type: String, required: true, select: false },
    portfolioProjects: [{ type: Object }],
    // see above comment, these would exist in a profileLinks array
    portfolioUrl: { type: String },
    profilePicture: {type: String},
    role: { type: String, enum: ["Software Engineer", "UX Designer"]},
    savedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);
export default mongoose.model("User", User);
