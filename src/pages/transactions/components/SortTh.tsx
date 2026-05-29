import { SortKey, SortDir } from '../types';

export const SortTh = ({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  className = '',
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) => {
  const active = currentKey === sortKey;
  return (
    <th
      className={`px-6 py-4 cursor-pointer select-none group ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span
          className={`material-icons text-sm transition-colors ${
            active
              ? 'text-indigo-500'
              : 'text-gray-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          {active && dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </span>
    </th>
  );
};
