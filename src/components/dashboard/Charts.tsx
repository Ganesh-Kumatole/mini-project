import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useThemeContext } from '@/context/ThemeContext';
import { useCurrencyContext } from '@/context/CurrencyContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

// ── Shared palette ─────────────────────────────────────────────────────────────
const PALETTE = [
  '#6366f1',
  '#f97316',
  '#f43f5e',
  '#34d399',
  '#a78bfa',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
];

// ── Line Chart: Income vs Expenses ────────────────────────────────────────────
type LineChartProps = { labels: string[]; income: number[]; expense: number[] };

export const LineChart: React.FC<LineChartProps> = ({
  labels,
  income,
  expense,
}) => {
  const { theme } = useThemeContext();
  const { symbol } = useCurrencyContext();
  const isDark = theme === 'dark';
  const ct = isDark ? '#94a3b8' : '#64748b';
  const cg = isDark ? 'rgba(148,163,184,0.10)' : 'rgba(100,116,139,0.10)';

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: income,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.10)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Expense',
        data: expense,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: ct, boxWidth: 12, padding: 12, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.dataset.label}: ${symbol}${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: ct, font: { size: 11 } }, grid: { color: cg } },
      y: {
        beginAtZero: true,
        ticks: { color: ct, callback: (v: any) => `${symbol}${v}` },
        grid: { color: cg },
      },
    },
  };

  return <Line data={data} options={options} />;
};

// ── Donut Chart: Category breakdown ────────────────────────────────────────────
type DonutChartProps = { labels: string[]; data: number[] };

export const DonutChart: React.FC<DonutChartProps> = ({ labels, data }) => {
  const { theme } = useThemeContext();
  const { formatAmount } = useCurrencyContext();
  const isDark = theme === 'dark';
  const ct = isDark ? '#94a3b8' : '#64748b';

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        hoverOffset: 8,
        borderWidth: 2,
        borderColor: isDark ? '#1e293b' : '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: ct, boxWidth: 12, padding: 10, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${formatAmount(ctx.parsed)}`,
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

// ── Bar Chart: Budget vs Actual ────────────────────────────────────────────────
type BarChartProps = { labels: string[]; budgeted: number[]; actual: number[] };

export const BudgetBarChart: React.FC<BarChartProps> = ({
  labels,
  budgeted,
  actual,
}) => {
  const { theme } = useThemeContext();
  const { symbol } = useCurrencyContext();
  const isDark = theme === 'dark';
  const ct = isDark ? '#94a3b8' : '#64748b';
  const cg = isDark ? 'rgba(148,163,184,0.10)' : 'rgba(100,116,139,0.10)';

  const data = {
    labels,
    datasets: [
      {
        label: 'Budgeted',
        data: budgeted,
        backgroundColor: 'rgba(99,102,241,0.5)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Actual',
        data: actual,
        backgroundColor: actual.map((v, i) =>
          v > budgeted[i] ? 'rgba(239,68,68,0.7)' : 'rgba(34,197,94,0.6)',
        ),
        borderColor: actual.map((v, i) =>
          v > budgeted[i] ? '#ef4444' : '#22c55e',
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: ct, boxWidth: 12, padding: 12, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.dataset.label}: ${symbol}${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: ct, font: { size: 11 } },
        grid: { color: 'transparent' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: ct, callback: (v: any) => `${symbol}${v}` },
        grid: { color: cg },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default { LineChart, DonutChart, BudgetBarChart };
