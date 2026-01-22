import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  data: number[];
  labels: string[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, labels }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Current',
        data,
        backgroundColor: 'rgba(120, 119, 198, 0.1)',
        borderColor: '#7877C6',
        borderWidth: 2,
        pointBackgroundColor: '#7877C6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#7877C6',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        min: 0,
        ticks: {
          stepSize: 2,
          color: '#A1A1A6',
          backdropColor: 'transparent',
          font: {
            size: 10
          }
        },
        grid: {
          color: '#E5E5E5'
        },
        pointLabels: {
          color: '#6E6E73',
          font: {
            size: 11,
            family: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1D1D1F',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    }
  };

  return <Radar data={chartData} options={options} />;
};
