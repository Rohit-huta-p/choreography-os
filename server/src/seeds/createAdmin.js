import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

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

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'kazi@gmail.com' });
    if (existing) {
      console.log('Admin user kazi@gmail.com already exists. Updating password...');
      existing.password_hash = await bcrypt.hash('123456', 12);
      await existing.save();
      console.log('Password updated successfully.');
    } else {
      const password_hash = await bcrypt.hash('123456', 12);
      await User.create({
        name: 'Admin',
        email: 'kazi@gmail.com',
        password_hash,
        subscription: { plan: 'studio', status: 'active' },
      });
      console.log('Admin user created successfully!');
    }

    console.log('  Email: kazi@gmail.com');
    console.log('  Password: 123456');
    console.log('  Plan: studio');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
