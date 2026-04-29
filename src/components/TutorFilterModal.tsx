import React, { useMemo, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TutorProfile } from '../types';
import { TutorFilters, DEFAULT_FILTERS } from '../types/filters';
import { countActiveFilters } from '../utils/tutorFilters';
import { extractSubjects } from '../utils/tutorDataParsing';
import { CitiesFilter } from './filters/CitiesFilter';
import { SubjectsFilter } from './filters/SubjectsFilter';
import { FeeRangeFilter } from './filters/FeeRangeFilter';
import { TimePeriodsFilter } from './filters/TimePeriodsFilter';
import { DaysFilter } from './filters/DaysFilter';
import { GenderFilter } from './filters/GenderFilter';
import { SchoolExperienceFilter } from './filters/SchoolExperienceFilter';
import { VehicleFilter } from './filters/VehicleFilter';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { VerificationFilter } from './filters/VerificationFilter';

interface TutorFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TutorFilters;
  onFiltersChange: (filters: TutorFilters) => void;
  tutors: TutorProfile[];
}

interface FilterSection {
  id: string;
  label: string;
  activeCount: number;
}

export const TutorFilterModal: React.FC<TutorFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  tutors
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['cities', 'subjects']));

  // Extract available options
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    tutors.forEach(t => {
      const city = t['Preferred City'] || t.City;
      if (city) cities.add(city);
    });
    return Array.from(cities).sort();
  }, [tutors]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    tutors.forEach(t => {
      extractSubjects(t['Preferred Subject(s)'] || t.subjects).forEach(s => subjects.add(s));
    });
    return Array.from(subjects).sort();
  }, [tutors]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleClearAll = () => {
    onFiltersChange(DEFAULT_FILTERS);
    setExpandedSections(new Set(['cities', 'subjects']));
  };

  const activeFiltersCount = countActiveFilters(filters);

  const filterSections: FilterSection[] = [
    { id: 'cities', label: 'Cities', activeCount: filters.cities.length },
    { id: 'subjects', label: 'Subjects', activeCount: filters.subjects.length },
    { id: 'fee', label: 'Fee Range', activeCount: filters.feeRange[0] > 0 || filters.feeRange[1] < 10000 ? 1 : 0 },
    { id: 'time', label: 'Time Periods', activeCount: filters.timePeriods.length },
    { id: 'days', label: 'Days Available', activeCount: filters.daysAvailable.length },
    { id: 'gender', label: 'Gender', activeCount: filters.gender !== null ? 1 : 0 },
    { id: 'experience', label: 'School Experience', activeCount: filters.schoolExperience !== null ? 1 : 0 },
    { id: 'vehicle', label: 'Vehicle Ownership', activeCount: filters.hasVehicle !== null ? 1 : 0 },
    { id: 'lastUpdated', label: 'Last Updated', activeCount: 0 },
    { id: 'verification', label: 'Verification Status', activeCount: filters.verificationStatus.length }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h2>
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 space-y-2">
              {filterSections.map(section => (
                <div key={section.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{section.label}</span>
                      {section.activeCount > 0 && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {section.activeCount}
                        </span>
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedSections.has(section.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50"
                      >
                        {section.id === 'cities' && (
                          <CitiesFilter
                            value={filters.cities}
                            onChange={(cities) => onFiltersChange({ ...filters, cities })}
                            availableCities={availableCities}
                          />
                        )}
                        {section.id === 'subjects' && (
                          <SubjectsFilter
                            value={filters.subjects}
                            onChange={(subjects) => onFiltersChange({ ...filters, subjects })}
                            availableSubjects={availableSubjects}
                          />
                        )}
                        {section.id === 'fee' && (
                          <FeeRangeFilter
                            value={filters.feeRange}
                            onChange={(feeRange) => onFiltersChange({ ...filters, feeRange })}
                          />
                        )}
                        {section.id === 'time' && (
                          <TimePeriodsFilter
                            value={filters.timePeriods}
                            onChange={(timePeriods) => onFiltersChange({ ...filters, timePeriods })}
                          />
                        )}
                        {section.id === 'days' && (
                          <DaysFilter
                            value={filters.daysAvailable}
                            onChange={(daysAvailable) => onFiltersChange({ ...filters, daysAvailable })}
                          />
                        )}
                        {section.id === 'gender' && (
                          <GenderFilter
                            value={filters.gender}
                            onChange={(gender) => onFiltersChange({ ...filters, gender })}
                          />
                        )}
                        {section.id === 'experience' && (
                          <SchoolExperienceFilter
                            value={filters.schoolExperience}
                            onChange={(schoolExperience) => onFiltersChange({ ...filters, schoolExperience })}
                          />
                        )}
                        {section.id === 'vehicle' && (
                          <VehicleFilter
                            value={filters.hasVehicle}
                            onChange={(hasVehicle) => onFiltersChange({ ...filters, hasVehicle })}
                          />
                        )}
                        {section.id === 'lastUpdated' && (
                          <DateRangeFilter
                            value={filters.lastUpdatedRange}
                            onChange={(lastUpdatedRange) => onFiltersChange({ ...filters, lastUpdatedRange })}
                          />
                        )}
                        {section.id === 'verification' && (
                          <VerificationFilter
                            value={filters.verificationStatus}
                            onChange={(verificationStatus) => onFiltersChange({ ...filters, verificationStatus })}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 flex gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
