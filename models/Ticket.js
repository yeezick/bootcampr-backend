const Ticket = new Schema(
  {
    title: { type: String },
    status: { type: String, enum: ['To Do', 'In progress', 'Under Review', 'Completed'] },
    description: { type: String },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    image: { type: String },
    ProjectId: { type: String },
  },
  { timestamps: true },
);
export default mongoose.model('Ticket', Ticket);
