import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

type LineChartProps = {
  labels: string[];
  income: number[];
  expense: number[];
};

export const LineChart: React.FC<LineChartProps> = ({
  labels,
  income,
  expense,
}) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: income,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(16,163,127,0.08)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Expense',
        data: expense,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220,38,38,0.06)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Line data={data} options={options} />;
};

type DonutChartProps = {
  labels: string[];
  data: number[];
};

export const DonutChart: React.FC<DonutChartProps> = ({ labels, data }) => {
  const colors = [
    '#60a5fa',
    '#f97316',
    '#f43f5e',
    '#34d399',
    '#a78bfa',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'right' as const } },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default { LineChart, DonutChart };
