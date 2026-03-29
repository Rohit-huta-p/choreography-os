import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    event_date: { type: Date },
    template_source: { type: String },
    is_deleted: { type: Boolean, default: false },
    deleted_at: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

projectSchema.index({ user_id: 1, is_deleted: 1, updated_at: -1 });

export default mongoose.model('Project', projectSchema);
