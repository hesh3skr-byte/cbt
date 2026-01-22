import mongoose, { Schema } from 'mongoose';
import { IHealthRecord } from '../types';

const WorkoutSchema = new Schema({
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  caloriesBurned: { type: Number },
  notes: { type: String, default: '' }
}, { _id: false });

const NutritionSchema = new Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  meals: [{
    name: { type: String, required: true },
    time: { type: Date, required: true }
  }]
}, { _id: false });

const HealthRecordSchema = new Schema<IHealthRecord>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  workout: {
    type: WorkoutSchema
  },
  nutrition: {
    type: NutritionSchema
  },
  linkedWhoopCycleId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient date queries
HealthRecordSchema.index({ userId: 1, date: -1 });

export const HealthRecord = mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);
