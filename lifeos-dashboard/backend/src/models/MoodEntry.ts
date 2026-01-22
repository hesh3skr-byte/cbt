import mongoose, { Schema } from 'mongoose';
import { IMoodEntry } from '../types';

const ThoughtRecordSchema = new Schema({
  situation: { type: String, required: true },
  automaticThoughts: { type: String, required: true },
  cognitiveDistortions: [{ type: String }],
  evidence: {
    for: { type: String, default: '' },
    against: { type: String, default: '' }
  },
  balancedThought: { type: String, default: '' }
}, { _id: false });

const LifeBalanceRatingsSchema = new Schema({
  physical: { type: Number, min: 1, max: 10, required: true },
  mental: { type: Number, min: 1, max: 10, required: true },
  financial: { type: Number, min: 1, max: 10, required: true },
  career: { type: Number, min: 1, max: 10, required: true },
  relationships: { type: Number, min: 1, max: 10, required: true },
  learning: { type: Number, min: 1, max: 10, required: true },
  spiritual: { type: Number, min: 1, max: 10, required: true },
  fun: { type: Number, min: 1, max: 10, required: true }
}, { _id: false });

const MoodEntrySchema = new Schema<IMoodEntry>({
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
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'low', 'struggling'],
    required: true
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  emotions: {
    type: [String],
    default: []
  },
  thoughtRecord: {
    type: ThoughtRecordSchema
  },
  gratitude: {
    type: [String],
    default: []
  },
  lifeBalanceRatings: {
    type: LifeBalanceRatingsSchema,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient date queries
MoodEntrySchema.index({ userId: 1, date: -1 });

export const MoodEntry = mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);
