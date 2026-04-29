import React, { useMemo } from 'react';
import { BookOpen, Search, X } from 'lucide-react';

interface SubjectsFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableSubjects: string[];
}

export const SubjectsFilter: React.FC<SubjectsFilterProps> = ({ value, onChange, availableSubjects }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return availableSubjects;
    return availableSubjects.filter(subject =>
      subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, availableSubjects]);

  const toggleSubject = (subject: string) => {
    if (value.includes(subject)) {
      onChange(value.filter(s => s !== subject));
    } else {
      onChange([...value, subject]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map(subject => (
            <label key={subject} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={value.includes(subject)}
                onChange={() => toggleSubject(subject)}
                className="w-4 h-4 rounded"
              />
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{subject}</span>
              {value.includes(subject) && (
                <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  ✓
                </span>
              )}
            </label>
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No subjects found</p>
        )}
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
