import mongoose, { Schema } from 'mongoose';
import { IWhoopCache } from '../types';

const RecoverySchema = new Schema({
  score: { type: Number, required: true },
  hrv: { type: Number, required: true },
  restingHeartRate: { type: Number, required: true },
  sleepPerformance: { type: Number, required: true }
}, { _id: false });

const SleepSchema = new Schema({
  duration: { type: Number, required: true },
  quality: { type: Number, required: true },
  stages: {
    wake: { type: Number, required: true },
    light: { type: Number, required: true },
    deep: { type: Number, required: true },
    rem: { type: Number, required: true }
  },
  disturbances: { type: Number, required: true }
}, { _id: false });

const StrainSchema = new Schema({
  score: { type: Number, required: true },
  averageHeartRate: { type: Number, required: true },
  maxHeartRate: { type: Number, required: true },
  calories: { type: Number, required: true }
}, { _id: false });

const WhoopCacheSchema = new Schema<IWhoopCache>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  cycleId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  recovery: {
    type: RecoverySchema,
    required: true
  },
  sleep: {
    type: SleepSchema,
    required: true
  },
  strain: {
    type: StrainSchema,
    required: true
  },
  cachedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // TTL: 24 hours (auto-delete)
  }
});

// Compound index for efficient queries
WhoopCacheSchema.index({ userId: 1, cycleId: 1 }, { unique: true });

export const WhoopCache = mongoose.model<IWhoopCache>('WhoopCache', WhoopCacheSchema);
