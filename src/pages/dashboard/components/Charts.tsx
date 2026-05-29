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
import { useThemeContext, useCurrencyContext } from '@/shared/context';
import {
  CHART_PALETTE,
  LINE_CHART_COLORS,
  BUDGET_CHART_COLORS,
  getTextColor,
  getGridColor,
  getBorderColor,
  CHART_CONFIG,
} from '../utils/chartColors';

// Register ChartJS components
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

// Line Chart: Income vs Expense trend
type LineChartProps = { labels: string[]; income: number[]; expense: number[] };

export const LineChart: React.FC<LineChartProps> = ({
  labels,
  income,
  expense,
}) => {
  const { theme } = useThemeContext();
  const { symbol } = useCurrencyContext();
  const textColor = getTextColor(theme as any, 'primary');
  const gridColor = getGridColor(theme as any);

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: income,
        borderColor: LINE_CHART_COLORS.income.border,
        backgroundColor: LINE_CHART_COLORS.income.background,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Expense',
        data: expense,
        borderColor: LINE_CHART_COLORS.expense.border,
        backgroundColor: LINE_CHART_COLORS.expense.background,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...CHART_CONFIG.common,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          boxWidth: CHART_CONFIG.spacing.boxWidth,
          padding: CHART_CONFIG.spacing.padding,
          font: { size: CHART_CONFIG.font.medium },
        },
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
        ticks: { color: textColor, font: { size: CHART_CONFIG.font.small } },
        grid: { color: gridColor },
      },
      y: {
        beginAtZero: true,
        ticks: { color: textColor, callback: (v: any) => `${symbol}${v}` },
        grid: { color: gridColor },
      },
    },
  };

  return <Line data={data} options={options} />;
};

// Donut Chart: Category breakdown
type DonutChartProps = { labels: string[]; data: number[] };

export const DonutChart: React.FC<DonutChartProps> = ({ labels, data }) => {
  const { theme } = useThemeContext();
  const { formatAmount } = useCurrencyContext();
  const textColor = getTextColor(theme as any, 'primary');
  const borderColor = getBorderColor(theme as any);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map(
          (_, i) => CHART_PALETTE[i % CHART_PALETTE.length],
        ),
        hoverOffset: 8,
        borderWidth: 2,
        borderColor: borderColor,
      },
    ],
  };

  const options = {
    ...CHART_CONFIG.common,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: textColor,
          boxWidth: CHART_CONFIG.spacing.boxWidth,
          padding: CHART_CONFIG.spacing.padding - 2,
          font: { size: CHART_CONFIG.font.small },
        },
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

// Bar Chart: Budget vs Actual
type BarChartProps = { labels: string[]; budgeted: number[]; actual: number[] };

export const BudgetBarChart: React.FC<BarChartProps> = ({
  labels,
  budgeted,
  actual,
}) => {
  const { theme } = useThemeContext();
  const { symbol } = useCurrencyContext();
  const textColor = getTextColor(theme as any, 'primary');
  const gridColor = getGridColor(theme as any);

  const data = {
    labels,
    datasets: [
      {
        label: 'Budgeted',
        data: budgeted,
        backgroundColor: BUDGET_CHART_COLORS.budgeted.background,
        borderColor: BUDGET_CHART_COLORS.budgeted.border,
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Actual',
        data: actual,
        backgroundColor: actual.map((v, i) =>
          v > budgeted[i]
            ? BUDGET_CHART_COLORS.actualOver.background
            : BUDGET_CHART_COLORS.actualUnder.background,
        ),
        borderColor: actual.map((v, i) =>
          v > budgeted[i]
            ? BUDGET_CHART_COLORS.actualOver.border
            : BUDGET_CHART_COLORS.actualUnder.border,
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    ...CHART_CONFIG.common,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          boxWidth: CHART_CONFIG.spacing.boxWidth,
          padding: CHART_CONFIG.spacing.padding,
          font: { size: CHART_CONFIG.font.small },
        },
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
        ticks: { color: textColor, font: { size: CHART_CONFIG.font.small } },
        grid: { color: 'transparent' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: textColor, callback: (v: any) => `${symbol}${v}` },
        grid: { color: gridColor },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
