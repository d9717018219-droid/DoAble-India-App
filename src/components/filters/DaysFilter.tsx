import React from 'react';
import { Calendar } from 'lucide-react';
import { DAYS_OF_WEEK } from '../../types/filters';

interface DaysFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const DaysFilter: React.FC<DaysFilterProps> = ({ value, onChange }) => {
  const toggleDay = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter(d => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {DAYS_OF_WEEK.map(day => (
          <label key={day} className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(day)}
              onChange={() => toggleDay(day)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {day.substring(0, 3)}
            </span>
          </label>
        ))}
      </div>

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
