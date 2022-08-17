import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Tool = new Schema(
  {
    category: {type: String, enum: ["Engineering", "Design"]},
    icon: { type: String, },
    name: { type: String, required: true,},
  },
  {timestamps: true}
);

export default mongoose.model('tools', Tool);
