import mongoose from 'mongoose';

const canvasObjectSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    type: {
      type: String,
      required: true,
      enum: ['performance', 'roster', 'props_board', 'show_flow', 'task'],
    },
    position: {
      x: { type: Number, required: true, default: 0 },
      y: { type: Number, required: true, default: 0 },
    },
    size: {
      width: { type: Number, required: true, default: 300 },
      height: { type: Number, required: true, default: 200 },
    },
    z_index: { type: Number, default: 0 },
    collapsed: { type: Boolean, default: false },
    reference_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

canvasObjectSchema.index({ project_id: 1 });

export default mongoose.model('CanvasObject', canvasObjectSchema);
