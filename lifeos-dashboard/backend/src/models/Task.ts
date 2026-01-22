import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const TaskSchema = new Schema<ITask>({
  userId: {
    type: String,
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
  status: {
    type: String,
    enum: ['inbox', 'next', 'waiting', 'someday', 'done'],
    default: 'inbox',
    index: true
  },
  eisenhowerQuadrant: {
    type: String,
    enum: ['urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important'],
    index: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  dueDate: {
    type: Date
  },
  tags: {
    type: [String],
    default: []
  },
  project: {
    type: String
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Auto-set completedAt when status changes to 'done'
  if (this.status === 'done' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'done' && this.completedAt) {
    this.completedAt = undefined;
  }

  next();
});

// Compound indexes for efficient queries
TaskSchema.index({ userId: 1, status: 1, eisenhowerQuadrant: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
