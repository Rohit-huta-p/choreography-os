import mongoose from 'mongoose';

const performerSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, trim: true, maxlength: 100 },
    contact: { type: String, trim: true, maxlength: 200 },
    notes: { type: String, maxlength: 5000 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

performerSchema.index({ project_id: 1 });

export default mongoose.model('Performer', performerSchema);
