export interface User {
  id: string;
  email: string;
  name: string;
  settings: {
    whoopApiKey?: string;
    timezone: string;
    weekStartsOn: 'monday' | 'sunday';
    theme: 'light' | 'dark' | 'auto';
  };
  dashboardLayout: {
    modules: DashboardModule[];
  };
}

export interface DashboardModule {
  id: string;
  visible: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Goal {
  _id: string;
  userId: string;
  category: 'physical' | 'mental' | 'financial' | 'career' | 'relationships' | 'learning' | 'spiritual' | 'fun';
  title: string;
  description: string;
  targetDate?: string;
  milestones: Milestone[];
  progress: number;
  linkedHabits: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  title: string;
  completed: boolean;
  completedAt?: string;
  weight: number;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  targetDays: number[];
  currentStreak: number;
  longestStreak: number;
  completions: HabitCompletion[];
  linkedGoalId?: string;
  createdAt: string;
}

export interface HabitCompletion {
  date: string;
  completed: boolean;
  note?: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: 'inbox' | 'next' | 'waiting' | 'someday' | 'done';
  eisenhowerQuadrant?: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  priority: number;
  dueDate?: string;
  tags: string[];
  project?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhoopData {
  recovery: {
    score: number;
    hrv: number;
    restingHeartRate: number;
    sleepPerformance: number;
  };
  sleep: {
    duration: number;
    quality: number;
    stages: {
      wake: number;
      light: number;
      deep: number;
      rem: number;
    };
    disturbances: number;
  };
  strain: {
    score: number;
    averageHeartRate: number;
    maxHeartRate: number;
    calories: number;
  };
  date: string;
  cachedAt: string;
}

export interface WhoopTrends {
  avgRecovery: number;
  avgHRV: number;
  avgSleep: number;
  trend: 'improving' | 'declining' | 'stable' | 'insufficient-data';
  recoveryHistory: Array<{ date: string; score: number }>;
  insight: string;
}

export interface MoodEntry {
  _id: string;
  userId: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'low' | 'struggling';
  moodScore: number;
  emotions: string[];
  thoughtRecord?: ThoughtRecord;
  gratitude: string[];
  lifeBalanceRatings: LifeBalanceRatings;
  createdAt: string;
}

export interface ThoughtRecord {
  situation: string;
  automaticThoughts: string;
  cognitiveDistortions: string[];
  evidence: {
    for: string;
    against: string;
  };
  balancedThought: string;
}

export interface LifeBalanceRatings {
  physical: number;
  mental: number;
  financial: number;
  career: number;
  relationships: number;
  learning: number;
  spiritual: number;
  fun: number;
}
