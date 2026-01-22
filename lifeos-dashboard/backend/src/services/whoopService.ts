import { WhoopCache } from '../models/WhoopCache';
import { User } from '../models/User';
import { decrypt } from '../utils/encryption';
import { differenceInHours, subDays, startOfDay } from 'date-fns';

interface WhoopCycleResponse {
  id: number;
  days: string[];
  during: {
    lower: string;
    upper: string;
  };
  score_state: string;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
  recovery?: {
    score: number;
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage: number;
    skin_temp_celsius: number;
  };
  sleep?: {
    id: number;
    quality_duration: number;
    latency: number;
    debt: number;
    need: {
      baseline: number;
      need_from_sleep_debt: number;
      need_from_recent_strain: number;
      need_from_recent_nap: number;
    };
    score: number;
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
    };
    disturbances: number;
  };
}

export class WhoopService {
  private baseURL = 'https://api.whoop.com/developer/v1';

  async getUserApiKey(userId: string): Promise<string | null> {
    const user = await User.findById(userId);
    if (!user || !user.settings.whoopApiKey) return null;

    return decrypt(user.settings.whoopApiKey);
  }

  async fetchDailyCycle(userId: string, date: Date): Promise<any> {
    // Check cache first
    const cached = await WhoopCache.findOne({
      userId,
      date: startOfDay(date)
    });

    if (cached && !this.isCacheStale(cached.cachedAt)) {
      return this.formatCacheData(cached);
    }

    // Fetch from Whoop API
    const apiKey = await this.getUserApiKey(userId);
    if (!apiKey) {
      throw new Error('Whoop API key not configured');
    }

    try {
      const cycleData = await this.retryFetch(
        `${this.baseURL}/cycles`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        },
        3
      );

      // Parse and cache the most recent cycle
      if (cycleData && cycleData.length > 0) {
        const latestCycle = cycleData[0] as WhoopCycleResponse;
        const parsedData = this.parseCycleData(latestCycle);

        await WhoopCache.findOneAndUpdate(
          { userId, cycleId: latestCycle.id.toString() },
          {
            userId,
            cycleId: latestCycle.id.toString(),
            date: startOfDay(date),
            ...parsedData,
            cachedAt: new Date()
          },
          { upsert: true, new: true }
        );

        return parsedData;
      }

      return null;
    } catch (error: any) {
      console.error('Whoop API error:', error.message);
      // Return cached data even if stale
      if (cached) return this.formatCacheData(cached);
      throw error;
    }
  }

  async getWeeklyTrends(userId: string): Promise<any> {
    const sevenDaysAgo = subDays(new Date(), 7);
    const cycles = await WhoopCache.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    if (cycles.length === 0) {
      return {
        avgRecovery: 0,
        avgHRV: 0,
        avgSleep: 0,
        trend: 'insufficient-data',
        recoveryHistory: []
      };
    }

    const avgRecovery = Math.round(
      cycles.reduce((sum, c) => sum + c.recovery.score, 0) / cycles.length
    );
    const avgHRV = Math.round(
      cycles.reduce((sum, c) => sum + c.recovery.hrv, 0) / cycles.length
    );
    const avgSleep = Math.round(
      cycles.reduce((sum, c) => sum + c.sleep.duration, 0) / cycles.length
    );

    const trend = this.calculateTrend(cycles);

    return {
      avgRecovery,
      avgHRV,
      avgSleep,
      trend,
      recoveryHistory: cycles.map(c => ({
        date: c.date,
        score: c.recovery.score
      })),
      insight: this.generateInsight(avgRecovery, trend)
    };
  }

  private parseCycleData(cycle: WhoopCycleResponse): any {
    return {
      recovery: {
        score: cycle.recovery?.recovery_score || 0,
        hrv: cycle.recovery?.hrv_rmssd_milli || 0,
        restingHeartRate: cycle.recovery?.resting_heart_rate || 0,
        sleepPerformance: cycle.sleep?.score || 0
      },
      sleep: {
        duration: cycle.sleep?.stage_summary?.total_in_bed_time_milli ?
          Math.round(cycle.sleep.stage_summary.total_in_bed_time_milli / 60000) : 0,
        quality: cycle.sleep?.score || 0,
        stages: {
          wake: cycle.sleep?.stage_summary?.total_awake_time_milli || 0,
          light: cycle.sleep?.stage_summary?.total_light_sleep_time_milli || 0,
          deep: cycle.sleep?.stage_summary?.total_slow_wave_sleep_time_milli || 0,
          rem: cycle.sleep?.stage_summary?.total_rem_sleep_time_milli || 0
        },
        disturbances: cycle.sleep?.disturbances || 0
      },
      strain: {
        score: cycle.score?.strain || 0,
        averageHeartRate: cycle.score?.average_heart_rate || 0,
        maxHeartRate: cycle.score?.max_heart_rate || 0,
        calories: cycle.score?.kilojoule ? Math.round(cycle.score.kilojoule * 0.239) : 0
      }
    };
  }

  private formatCacheData(cache: any): any {
    return {
      recovery: cache.recovery,
      sleep: cache.sleep,
      strain: cache.strain,
      date: cache.date,
      cachedAt: cache.cachedAt
    };
  }

  private isCacheStale(cachedAt: Date): boolean {
    return differenceInHours(new Date(), cachedAt) > 6;
  }

  private calculateTrend(cycles: any[]): string {
    if (cycles.length < 3) return 'stable';

    const recent = cycles.slice(0, 3);
    const older = cycles.slice(3, 6);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, c) => sum + c.recovery.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, c) => sum + c.recovery.score, 0) / older.length;

    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  private generateInsight(avgRecovery: number, trend: string): string {
    if (avgRecovery >= 67) {
      return 'Excellent recovery! Your body is well-prepared for high strain activities.';
    } else if (avgRecovery >= 34) {
      return trend === 'improving'
        ? 'Recovery is improving. Keep up your sleep and rest habits.'
        : 'Moderate recovery. Consider optimizing sleep and stress management.';
    } else {
      return 'Low recovery detected. Prioritize rest, sleep, and recovery activities.';
    }
  }

  private async retryFetch(url: string, options: any, retries: number): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);

        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        return await response.json();
      } catch (error: any) {
        if (i === retries - 1) throw error;

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}
