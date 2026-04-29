export interface TutorFilters {
  cities: string[];
  subjects: string[];
  feeRange: [number, number];
  timePeriods: string[];
  daysAvailable: string[];
  gender: string | null;
  schoolExperience: number | null;
  hasVehicle: boolean | null;
  lastUpdatedRange: [Date, Date];
  verificationStatus: string[];
  searchQuery: string;
}

export const DEFAULT_FILTERS: TutorFilters = {
  cities: [],
  subjects: [],
  feeRange: [0, 10000],
  timePeriods: [],
  daysAvailable: [],
  gender: null,
  schoolExperience: null,
  hasVehicle: null,
  lastUpdatedRange: [new Date(2020, 0, 1), new Date()],
  verificationStatus: [],
  searchQuery: ''
};

export const TIME_PERIODS = ['Morning', 'Afternoon', 'Evening'] as const;
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const GENDERS = ['Male', 'Female'] as const;
export const VERIFICATION_STATUS = ['Verified', 'Unverified'] as const;
