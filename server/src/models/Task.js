import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    tasks: [
      {
        text: { type: String, required: true, trim: true, maxlength: 500 },
        completed: { type: Boolean, default: false },
        order: { type: Number, required: true },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

taskSchema.index({ project_id: 1 });

export default mongoose.model('Task', taskSchema);
