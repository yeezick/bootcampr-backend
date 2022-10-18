import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    about: { type: String, maxlength: 300 },
    email: {
      // match: /.+\@.+\..+/,
      type: String,
      required: true,
      // unique: [true, "E-mail already exists."],
    },
    member_of_projects: { type: Array },
    first_name: { type: String, required: true },
    fun_fact: { type: String },
    interested_projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    last_name: { type: String, required: true },
    password_digest: { type: String, required: true, select: false },
    portfolio_projects: [{ type: Object }],
    portfolio_link: { type: String },
    show_portfolio: { type: Boolean },
    rejected_projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    role: { type: String, enum: ["Software Engineer", "UX Designer"] },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
export { User };
