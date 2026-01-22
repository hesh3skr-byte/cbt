import mongoose, { Schema } from 'mongoose';
import { IHabit } from '../types';
import { startOfDay, differenceInDays, isSameDay } from 'date-fns';

const CompletionSchema = new Schema({
  date: { type: Date, required: true, index: true },
  completed: { type: Boolean, required: true },
  note: { type: String, default: '' }
}, { _id: false });

const HabitSchema = new Schema<IHabit>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: '⭐'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  targetDays: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6] // All days by default
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  completions: {
    type: [CompletionSchema],
    default: []
  },
  linkedGoalId: {
    type: String,
    ref: 'Goal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate streaks when marking completion
HabitSchema.methods.calculateStreak = function() {
  if (this.completions.length === 0) {
    this.currentStreak = 0;
    return;
  }

  // Sort completions by date descending
  const sorted = this.completions
    .filter((c: any) => c.completed)
    .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

  if (sorted.length === 0) {
    this.currentStreak = 0;
    return;
  }

  let streak = 0;
  const today = startOfDay(new Date());
  let currentDate = sorted[0].date;

  // Check if most recent completion is today or yesterday
  const daysSinceLastCompletion = differenceInDays(today, startOfDay(currentDate));
  if (daysSinceLastCompletion > 1) {
    this.currentStreak = 0;
    return;
  }

  // Count consecutive days
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      streak = 1;
      continue;
    }

    const prevDate = startOfDay(sorted[i - 1].date);
    const currDate = startOfDay(sorted[i].date);
    const dayDiff = differenceInDays(prevDate, currDate);

    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  this.currentStreak = streak;
  this.longestStreak = Math.max(this.longestStreak, streak);
};

// Index for efficient completion queries
HabitSchema.index({ userId: 1, 'completions.date': -1 });

export const Habit = mongoose.model<IHabit>('Habit', HabitSchema);
