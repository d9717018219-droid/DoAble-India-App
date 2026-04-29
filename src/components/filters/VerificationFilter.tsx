import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { VERIFICATION_STATUS } from '../../types/filters';

interface VerificationFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  'Verified': <CheckCircle2 className="w-4 h-4 text-green-500" />,
  'Unverified': <XCircle className="w-4 h-4 text-slate-400" />
};

export const VerificationFilter: React.FC<VerificationFilterProps> = ({ value, onChange }) => {
  const toggleStatus = (status: string) => {
    if (value.includes(status)) {
      onChange(value.filter(s => s !== status));
    } else {
      onChange([...value, status]);
    }
  };

  return (
    <div className="space-y-3">
      {VERIFICATION_STATUS.map(status => (
        <label key={status} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(status)}
            onChange={() => toggleStatus(status)}
            className="w-4 h-4 rounded"
          />
          {statusIcons[status]}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status}</span>
          {value.includes(status) && (
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
