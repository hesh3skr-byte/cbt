import mongoose, { Schema } from 'mongoose';
import { IGoal } from '../types';

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  weight: { type: Number, min: 1, max: 10, default: 5 }
}, { _id: false });

const GoalSchema = new Schema<IGoal>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['physical', 'mental', 'financial', 'career', 'relationships', 'learning', 'spiritual', 'fun'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  targetDate: {
    type: Date
  },
  milestones: {
    type: [MilestoneSchema],
    default: []
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  linkedHabits: [{
    type: String,
    ref: 'Habit'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate progress based on milestone completion
GoalSchema.pre('save', function(next) {
  if (this.milestones.length > 0) {
    const completedWeight = this.milestones
      .filter(m => m.completed)
      .reduce((sum, m) => sum + m.weight, 0);
    const totalWeight = this.milestones.reduce((sum, m) => sum + m.weight, 0);
    this.progress = Math.round((completedWeight / totalWeight) * 100);
  }
  this.updatedAt = new Date();
  next();
});

// Compound index for efficient queries
GoalSchema.index({ userId: 1, category: 1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
