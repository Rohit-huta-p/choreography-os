import mongoose from 'mongoose';

const propSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    quantity: { type: Number, default: 1, min: 1 },
    status: { type: String, enum: ['PENDING', 'ACQUIRED'], default: 'PENDING' },
    performance_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Performance' }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

propSchema.index({ project_id: 1 });

export default mongoose.model('Prop', propSchema);
