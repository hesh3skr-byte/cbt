import React, { useEffect, useState } from 'react';
import { Card } from '../Shared/Card';
import { ProgressRing } from '../Charts/ProgressRing';
import { Sparkline } from '../Charts/Sparkline';
import { api } from '../../utils/api';
import { WhoopTrends } from '../../types';
import { motion } from 'framer-motion';

export const WhoopModule: React.FC = () => {
  const [trends, setTrends] = useState<WhoopTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWhoopData();
  }, []);

  const fetchWhoopData = async () => {
    try {
      const response = await api.get<{ trends: WhoopTrends }>('/whoop/summary');
      setTrends(response.trends);
    } catch (error) {
      console.error('Failed to fetch Whoop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary">Loading...</p>
        </div>
      </Card>
    );
  }

  if (!trends || trends.trend === 'insufficient-data') {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Recovery</h3>
          <p className="text-text-secondary text-sm">
            Connect your Whoop to see recovery data
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-30" />

      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Recovery</h3>

        {/* Recovery Ring */}
        <div className="flex justify-center mb-6">
          <ProgressRing
            value={trends.avgRecovery}
            max={100}
            color={
              trends.avgRecovery >= 67
                ? '#34C759'
                : trends.avgRecovery >= 34
                ? '#FF9500'
                : '#FF3B30'
            }
            size={140}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-text-primary">{trends.avgHRV}</p>
            <p className="text-xs text-text-secondary">HRV (ms)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-text-primary">
              {Math.round(trends.avgSleep / 60)}h
            </p>
            <p className="text-xs text-text-secondary">Sleep</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-text-primary capitalize">
              {trends.trend}
            </p>
            <p className="text-xs text-text-secondary">Trend</p>
          </div>
        </div>

        {/* 7-day trend sparkline */}
        <div>
          <p className="text-sm text-text-secondary mb-2">7-Day Trend</p>
          <Sparkline
            data={trends.recoveryHistory.map((h) => h.score)}
            color="#34C759"
            height={40}
          />
        </div>

        {/* Insight */}
        {trends.insight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-white rounded-lg border border-border"
          >
            <p className="text-xs text-text-secondary leading-relaxed">{trends.insight}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};
