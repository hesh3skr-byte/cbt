import { Request } from 'express';
import { Document } from 'mongoose';

// Extended Express Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// User Types
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  settings: {
    whoopApiKey?: string;
    timezone: string;
    weekStartsOn: 'monday' | 'sunday';
    theme: 'light' | 'dark' | 'auto';
  };
  dashboardLayout: {
    modules: Array<{
      id: string;
      visible: boolean;
      order: number;
      size: 'small' | 'medium' | 'large';
    }>;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Goal Types
export type GoalCategory = 'physical' | 'mental' | 'financial' | 'career' | 'relationships' | 'learning' | 'spiritual' | 'fun';

export interface IMilestone {
  title: string;
  completed: boolean;
  completedAt?: Date;
  weight: number;
}

export interface IGoal extends Document {
  userId: string;
  category: GoalCategory;
  title: string;
  description: string;
  targetDate?: Date;
  milestones: IMilestone[];
  progress: number;
  linkedHabits: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Habit Types
export interface IHabitCompletion {
  date: Date;
  completed: boolean;
  note?: string;
}

export interface IHabit extends Document {
  userId: string;
  name: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  targetDays: number[];
  currentStreak: number;
  longestStreak: number;
  completions: IHabitCompletion[];
  linkedGoalId?: string;
  createdAt: Date;
}

// Task Types
export type TaskStatus = 'inbox' | 'next' | 'waiting' | 'someday' | 'done';
export type EisenhowerQuadrant = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';

export interface ITask extends Document {
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  eisenhowerQuadrant?: EisenhowerQuadrant;
  priority: number;
  dueDate?: Date;
  tags: string[];
  project?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Financial Types
export type TransactionType = 'income' | 'expense' | 'budget';

export interface IFinancial extends Document {
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  recurring: boolean;
  budgetMonth?: string;
  createdAt: Date;
}

// Health Types
export interface IWorkout {
  type: string;
  duration: number;
  caloriesBurned?: number;
  notes: string;
}

export interface INutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: Array<{ name: string; time: Date }>;
}

export interface IHealthRecord extends Document {
  userId: string;
  date: Date;
  workout?: IWorkout;
  nutrition?: INutrition;
  linkedWhoopCycleId?: string;
  createdAt: Date;
}

// Mood Types
export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'struggling';

export interface IThoughtRecord {
  situation: string;
  automaticThoughts: string;
  cognitiveDistortions: string[];
  evidence: {
    for: string;
    against: string;
  };
  balancedThought: string;
}

export interface ILifeBalanceRatings {
  physical: number;
  mental: number;
  financial: number;
  career: number;
  relationships: number;
  learning: number;
  spiritual: number;
  fun: number;
}

export interface IMoodEntry extends Document {
  userId: string;
  date: Date;
  mood: MoodLevel;
  moodScore: number;
  emotions: string[];
  thoughtRecord?: IThoughtRecord;
  gratitude: string[];
  lifeBalanceRatings: ILifeBalanceRatings;
  createdAt: Date;
}

// Whoop Types
export interface IWhoopRecovery {
  score: number;
  hrv: number;
  restingHeartRate: number;
  sleepPerformance: number;
}

export interface IWhoopSleep {
  duration: number;
  quality: number;
  stages: {
    wake: number;
    light: number;
    deep: number;
    rem: number;
  };
  disturbances: number;
}

export interface IWhoopStrain {
  score: number;
  averageHeartRate: number;
  maxHeartRate: number;
  calories: number;
}

export interface IWhoopCache extends Document {
  userId: string;
  cycleId: string;
  date: Date;
  recovery: IWhoopRecovery;
  sleep: IWhoopSleep;
  strain: IWhoopStrain;
  cachedAt: Date;
}
