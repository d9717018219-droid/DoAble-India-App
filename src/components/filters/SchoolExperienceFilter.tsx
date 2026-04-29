import React from 'react';
import { Briefcase } from 'lucide-react';

interface SchoolExperienceFilterProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const EXPERIENCE_OPTIONS = [1, 2, 3, 5, 7, 10];

export const SchoolExperienceFilter: React.FC<SchoolExperienceFilterProps> = ({ value, onChange }) => {
  const [isCustom, setIsCustom] = React.useState(value !== null && !EXPERIENCE_OPTIONS.includes(value));
  const [customValue, setCustomValue] = React.useState(value?.toString() || '');

  const handlePreset = (years: number) => {
    setIsCustom(false);
    setCustomValue('');
    onChange(years);
  };

  const handleCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    if (val) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        onChange(num);
      }
    }
  };

  const handleCustomReset = () => {
    setIsCustom(false);
    setCustomValue('');
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <input
          type="radio"
          checked={value === null}
          onChange={() => {
            setIsCustom(false);
            setCustomValue('');
            onChange(null);
          }}
          className="w-4 h-4"
        />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Any Experience</span>
      </label>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Minimum Years:</p>
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE_OPTIONS.map(years => (
            <button
              key={years}
              onClick={() => handlePreset(years)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                value === years && !isCustom
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {years}+
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
          Custom Years:
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="50"
            value={customValue}
            onChange={handleCustom}
            placeholder="Enter years"
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isCustom && customValue && (
            <button
              onClick={handleCustomReset}
              className="px-2 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
