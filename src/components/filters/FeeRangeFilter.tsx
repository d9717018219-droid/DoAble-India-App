import React from 'react';
import { IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils';

interface FeeRangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const MIN_FEE = 0;
const MAX_FEE = 10000;
const STEP = 100;

export const FeeRangeFilter: React.FC<FeeRangeFilterProps> = ({ value, onChange }) => {
  const [min, max] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(parseInt(e.target.value), max);
    onChange([newMin, max]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(parseInt(e.target.value), min);
    onChange([min, newMax]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <IndianRupee className="w-4 h-4 text-slate-500" />
        <span className="text-slate-700 dark:text-slate-300 font-semibold">
          ₹{formatCurrency(min)} - ₹{formatCurrency(max)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">
            Minimum: ₹{formatCurrency(min)}
          </label>
          <input
            type="range"
            min={MIN_FEE}
            max={MAX_FEE}
            step={STEP}
            value={min}
            onChange={handleMinChange}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-2">
            Maximum: ₹{formatCurrency(max)}
          </label>
          <input
            type="range"
            min={MIN_FEE}
            max={MAX_FEE}
            step={STEP}
            value={max}
            onChange={handleMaxChange}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {(min > MIN_FEE || max < MAX_FEE) && (
        <button
          onClick={() => onChange([MIN_FEE, MAX_FEE])}
          className="w-full text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1"
        >
          Reset range
        </button>
      )}
    </div>
  );
};
