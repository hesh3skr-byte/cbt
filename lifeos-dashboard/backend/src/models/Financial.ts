import mongoose, { Schema } from 'mongoose';
import { IFinancial } from '../types';

const FinancialSchema = new Schema<IFinancial>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'budget'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  recurring: {
    type: Boolean,
    default: false
  },
  budgetMonth: {
    type: String // Format: 'YYYY-MM'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient date-range queries
FinancialSchema.index({ userId: 1, date: -1 });

export const Financial = mongoose.model<IFinancial>('Financial', FinancialSchema);
