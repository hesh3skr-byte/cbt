import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WhoopModule } from '../Modules/WhoopModule';
import { LifeBalanceModule } from '../Modules/LifeBalanceModule';
import { Button } from '../Shared/Button';
import { motion } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Life OS</h1>
            <p className="text-sm text-text-secondary">Welcome back, {user?.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Whoop Module */}
            <div className="md:col-span-1">
              <WhoopModule />
            </div>

            {/* Life Balance Module */}
            <div className="md:col-span-2">
              <LifeBalanceModule />
            </div>

            {/* Placeholder for more modules */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <div className="bg-surface rounded-xl shadow-card p-8 text-center">
                <p className="text-text-secondary">
                  More modules coming soon: Tasks, Habits, Goals, Finances, and more...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
