import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    songs: [
      {
        name: { type: String, trim: true },
        artist: { type: String, trim: true },
        duration_seconds: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ['NOT_STARTED', 'TEACHING', 'ALMOST_DONE', 'DONE'],
      default: 'NOT_STARTED',
    },
    notes: { type: String, maxlength: 5000 },
    performer_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Performer' }],
    prop_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prop' }],
    color_tag: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

performanceSchema.index({ project_id: 1 });

export default mongoose.model('Performance', performanceSchema);
