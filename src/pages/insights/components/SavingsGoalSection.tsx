import { useState } from 'react';
import { useCurrencyContext } from '@/shared/context';
import { SectionCard, SectionTitle } from './InsightsPrimitives';

const GOAL_KEY = 'fintracker_savings_goal';

export const SavingsGoalSection = ({
  currentSaved,
}: {
  currentSaved: number;
}) => {
  const { formatAmount, symbol } = useCurrencyContext();
  const [goal, setGoal] = useState<number>(() => {
    const stored = localStorage.getItem(GOAL_KEY);
    return stored ? parseFloat(stored) : 0;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const saveGoal = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed > 0) {
      setGoal(parsed);
      localStorage.setItem(GOAL_KEY, String(parsed));
    }
    setEditing(false);
  };

  const pct = goal > 0 ? Math.min((currentSaved / goal) * 100, 100) : 0;
  const barColor =
    pct >= 100
      ? 'bg-emerald-500'
      : pct >= 60
        ? 'bg-indigo-500'
        : pct >= 30
          ? 'bg-amber-400'
          : 'bg-red-400';
  const remaining = Math.max(goal - currentSaved, 0);

  return (
    <SectionCard>
      <SectionTitle icon="flag">{`Savings Goal`}</SectionTitle>

      {goal === 0 ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="material-icons text-4xl text-gray-300 dark:text-gray-600">
            savings
          </span>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
            Set a monthly savings goal to track your progress.
          </p>
          <button
            onClick={() => {
              setDraft('');
              setEditing(true);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Set Goal
          </button>
        </div>
      ) : editing ? null : (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {formatAmount(currentSaved)}
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                saved of {formatAmount(goal)} goal
              </p>
            </div>
            <div className="text-right">
              {pct >= 100 ? (
                <span className="text-emerald-500 font-semibold text-sm">
                  🎉 Goal reached!
                </span>
              ) : (
                <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                  {formatAmount(remaining)} to go
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`${barColor} h-3 rounded-full transition-all duration-700 relative`}
              style={{ width: `${pct}%` }}
            >
              {pct > 15 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setDraft(String(goal));
              setEditing(true);
            }}
            className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Change goal
          </button>
        </div>
      )}

      {editing && (
        <div className="bg-surface-light dark:bg-surface-dark mt-2 border border-border-light dark:border-border-dark p-4 rounded-xl space-y-4 shadow-sm animate-[fadeIn_0.2s_ease]">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-light dark:text-text-primary-dark">
              Monthly savings goal
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light dark:text-text-secondary-dark font-medium select-none">
                {symbol}
              </div>
              <input
                autoFocus
                type="number"
                min="0"
                step="50"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveGoal();
                  if (e.key === 'Escape') setEditing(false);
                }}
                placeholder="e.g. 500.00"
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm pl-8 py-2.5 transition-all"
              />
            </div>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono border border-border-light dark:border-border-dark shadow-sm">
                Enter
              </kbd>{' '}
              to save.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveGoal}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Save Goal
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
