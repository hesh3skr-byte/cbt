import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    whoopApiKey: {
      type: String,
      default: ''
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    weekStartsOn: {
      type: String,
      enum: ['monday', 'sunday'],
      default: 'sunday'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  dashboardLayout: {
    modules: [{
      id: { type: String, required: true },
      visible: { type: Boolean, default: true },
      order: { type: Number, required: true },
      size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      }
    }],
    default: () => [
      { id: 'whoop', visible: true, order: 1, size: 'medium' },
      { id: 'lifeBalance', visible: true, order: 2, size: 'large' },
      { id: 'tasks', visible: true, order: 3, size: 'medium' },
      { id: 'habits', visible: true, order: 4, size: 'medium' },
      { id: 'goals', visible: true, order: 5, size: 'medium' },
      { id: 'mood', visible: true, order: 6, size: 'small' }
    ]
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
