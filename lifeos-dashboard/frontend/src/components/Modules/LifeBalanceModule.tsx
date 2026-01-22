import React, { useEffect, useState } from 'react';
import { Card } from '../Shared/Card';
import { RadarChart } from '../Charts/RadarChart';
import { api } from '../../utils/api';
import { LifeBalanceRatings } from '../../types';
import { motion } from 'framer-motion';

export const LifeBalanceModule: React.FC = () => {
  const [ratings, setRatings] = useState<LifeBalanceRatings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLifeBalance();
  }, []);

  const fetchLifeBalance = async () => {
    try {
      const response = await api.get<{ lifeBalanceRatings: LifeBalanceRatings; date: string }>(
        '/mood/life-balance/latest'
      );
      setRatings(response.lifeBalanceRatings);
    } catch (error) {
      console.error('Failed to fetch life balance:', error);
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

  if (!ratings) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Life Balance</h3>
          <p className="text-text-secondary text-sm">
            Complete a mood check-in to see your life balance
          </p>
        </div>
      </Card>
    );
  }

  const data = [
    ratings.physical,
    ratings.mental,
    ratings.financial,
    ratings.career,
    ratings.relationships,
    ratings.learning,
    ratings.spiritual,
    ratings.fun
  ];

  const labels = [
    'Physical',
    'Mental',
    'Financial',
    'Career',
    'Relationships',
    'Learning',
    'Spiritual',
    'Fun'
  ];

  // Calculate overall balance score
  const avgScore = Math.round(data.reduce((sum, val) => sum + val, 0) / data.length);

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-30" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Life Balance</h3>
          <div className="text-right">
            <p className="text-2xl font-semibold text-text-primary">{avgScore}/10</p>
            <p className="text-xs text-text-secondary">Overall</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <RadarChart data={data} labels={labels} />
          </div>
        </div>

        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 gap-3"
        >
          {labels.map((label, index) => (
            <div
              key={label}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-border"
            >
              <span className="text-xs text-text-secondary">{label}</span>
              <span className="text-sm font-semibold text-text-primary">{data[index]}/10</span>
            </div>
          ))}
        </motion.div>
      </div>
    </Card>
  );
};
