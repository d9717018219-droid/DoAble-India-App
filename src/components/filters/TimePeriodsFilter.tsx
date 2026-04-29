import React from 'react';
import { Clock, Sun, Cloud, Moon } from 'lucide-react';
import { TIME_PERIODS } from '../../types/filters';

interface TimePeriodsFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const timeEmojis: Record<string, React.ReactNode> = {
  'Morning': <Sun className="w-4 h-4 text-yellow-500" />,
  'Afternoon': <Cloud className="w-4 h-4 text-orange-400" />,
  'Evening': <Moon className="w-4 h-4 text-indigo-500" />
};

export const TimePeriodsFilter: React.FC<TimePeriodsFilterProps> = ({ value, onChange }) => {
  const togglePeriod = (period: string) => {
    if (value.includes(period)) {
      onChange(value.filter(p => p !== period));
    } else {
      onChange([...value, period]);
    }
  };

  return (
    <div className="space-y-3">
      {TIME_PERIODS.map(period => (
        <label key={period} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(period)}
            onChange={() => togglePeriod(period)}
            className="w-4 h-4 rounded"
          />
          {timeEmojis[period]}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{period}</span>
          {value.includes(period) && (
            <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              ✓
            </span>
          )}
        </label>
      ))}

      {value.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="w-full text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1"
        >
          Clear {value.length} selected
        </button>
      )}
    </div>
  );
};
