import React from 'react';
import { Car } from 'lucide-react';

interface VehicleFilterProps {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

export const VehicleFilter: React.FC<VehicleFilterProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <input
          type="radio"
          checked={value === null}
          onChange={() => onChange(null)}
          className="w-4 h-4"
        />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Any</span>
      </label>

      <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <input
          type="radio"
          checked={value === true}
          onChange={() => onChange(true)}
          className="w-4 h-4"
        />
        <Car className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Has Vehicle</span>
      </label>

      <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <input
          type="radio"
          checked={value === false}
          onChange={() => onChange(false)}
          className="w-4 h-4"
        />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">No Vehicle</span>
      </label>
    </div>
  );
};
