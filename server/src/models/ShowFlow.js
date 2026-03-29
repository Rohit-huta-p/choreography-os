import mongoose from 'mongoose';

const showFlowSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    entries: [
      {
        performance_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Performance' },
        duration_minutes: { type: Number, default: 0 },
        transition_notes: { type: String, maxlength: 1000 },
        order: { type: Number, required: true },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

showFlowSchema.index({ project_id: 1 });

export default mongoose.model('ShowFlow', showFlowSchema);
