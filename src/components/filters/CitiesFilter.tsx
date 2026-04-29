import React, { useMemo } from 'react';
import { MapPin, Search, X } from 'lucide-react';

interface CitiesFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableCities: string[];
}

export const CitiesFilter: React.FC<CitiesFilterProps> = ({ value, onChange, availableCities }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return availableCities;
    return availableCities.filter(city =>
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, availableCities]);

  const toggleCity = (city: string) => {
    if (value.includes(city)) {
      onChange(value.filter(c => c !== city));
    } else {
      onChange([...value, city]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search cities..."
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
        {filteredCities.length > 0 ? (
          filteredCities.map(city => (
            <label key={city} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={value.includes(city)}
                onChange={() => toggleCity(city)}
                className="w-4 h-4 rounded"
              />
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{city}</span>
              {value.includes(city) && (
                <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  ✓
                </span>
              )}
            </label>
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">No cities found</p>
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
