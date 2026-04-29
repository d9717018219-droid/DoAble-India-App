import React from 'react';
import { Sliders } from 'lucide-react';
import { motion } from 'motion/react';

interface TutorFilterButtonProps {
  activeFilterCount: number;
  onOpen: () => void;
}

export const TutorFilterButton: React.FC<TutorFilterButtonProps> = ({ activeFilterCount, onOpen }) => {
  return (
    <motion.button
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-xl font-semibold text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800 transition-all"
    >
      <Sliders className="w-4 h-4" />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <motion.span
          key={activeFilterCount}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ml-auto bg-blue-600 dark:bg-blue-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
        >
          {activeFilterCount > 9 ? '9+' : activeFilterCount}
        </motion.span>
      )}
    </motion.button>
  );
};
