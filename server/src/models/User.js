import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 200 },
    password_hash: { type: String, required: true },
    subscription: {
      plan: { type: String, enum: ['free', 'pro', 'studio'], default: 'free' },
      status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
      expires_at: { type: Date },
    },
    refresh_tokens: [{ type: String }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
