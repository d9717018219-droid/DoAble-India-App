import React from 'react';
import { GENDERS } from '../../types/filters';

interface GenderFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const GenderFilter: React.FC<GenderFilterProps> = ({ value, onChange }) => {
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

      {GENDERS.map(gender => (
        <label key={gender} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <input
            type="radio"
            checked={value === gender}
            onChange={() => onChange(gender)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{gender}</span>
        </label>
      ))}
    </div>
  );
};
