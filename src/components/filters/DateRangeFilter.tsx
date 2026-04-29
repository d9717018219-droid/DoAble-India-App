import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  value: [Date, Date];
  onChange: (value: [Date, Date]) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  const [startDate, endDate] = value;

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (newDate <= endDate) {
      onChange([newDate, endDate]);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (newDate >= startDate) {
      onChange([startDate, newDate]);
    }
  };

  const handleReset = () => {
    onChange([new Date(2020, 0, 1), new Date()]);
  };

  const daysDifference = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
        {daysDifference} days range
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={handleStartDateChange}
              max={formatDateForInput(endDate)}
              className="w-full pl-8 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
              min={formatDateForInput(startDate)}
              className="w-full pl-8 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {(startDate.getTime() !== new Date(2020, 0, 1).getTime() || endDate.getTime() !== new Date().getTime()) && (
        <button
          onClick={handleReset}
          className="w-full text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1"
        >
          Reset to all time
        </button>
      )}
    </div>
  );
};
