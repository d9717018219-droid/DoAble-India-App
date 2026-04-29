import { TutorProfile } from '../types';
import { TutorFilters } from '../types/filters';
import {
  extractSubjects,
  extractTimePeriods,
  extractDaysFromTeachingMode,
  parseFeeToNumber,
  parseSchoolExperience,
  parseRecordDate,
  getVerificationStatus,
  hasVehicle,
  normalizeGender,
  getCityFromTutor,
  getLocationString
} from './tutorDataParsing';

export const countActiveFilters = (filters: TutorFilters): number => {
  let count = 0;
  if (filters.cities.length > 0) count++;
  if (filters.subjects.length > 0) count++;
  if (filters.feeRange[0] > 0 || filters.feeRange[1] < 10000) count++;
  if (filters.timePeriods.length > 0) count++;
  if (filters.daysAvailable.length > 0) count++;
  if (filters.gender !== null) count++;
  if (filters.schoolExperience !== null) count++;
  if (filters.hasVehicle !== null) count++;
  if (filters.verificationStatus.length > 0) count++;
  if (filters.searchQuery.trim().length > 0) count++;
  return count;
};

const matchesCity = (tutor: TutorProfile, cities: string[]): boolean => {
  if (cities.length === 0) return true;
  const tutorCity = getCityFromTutor(tutor);
  return cities.some(c => c.toLowerCase() === tutorCity.toLowerCase());
};

const matchesSubjects = (tutor: TutorProfile, subjects: string[]): boolean => {
  if (subjects.length === 0) return true;
  const tutorSubjects = extractSubjects(tutor['Preferred Subject(s)']);
  return subjects.some(subj =>
    tutorSubjects.some(ts => ts.toLowerCase().includes(subj.toLowerCase()) || subj.toLowerCase().includes(ts.toLowerCase()))
  );
};

const matchesFeeRange = (tutor: TutorProfile, [min, max]: [number, number]): boolean => {
  const fee = parseFeeToNumber(tutor['Fee/Month']);
  return fee >= min && fee <= max;
};

const matchesTimePeriods = (tutor: TutorProfile, periods: string[]): boolean => {
  if (periods.length === 0) return true;
  const tutorPeriods = extractTimePeriods(tutor['Preferred Time']);
  return periods.some(period => tutorPeriods.includes(period));
};

const matchesDays = (tutor: TutorProfile, days: string[]): boolean => {
  if (days.length === 0) return true;
  const tutorDays = extractDaysFromTeachingMode(tutor['Mode of Teaching'] || tutor['Preferred Time']);
  if (tutorDays.length === 0) return false; // No days found means filter won't match
  return days.some(day => tutorDays.some(td => td.toLowerCase() === day.toLowerCase()));
};

const matchesGender = (tutor: TutorProfile, gender: string | null): boolean => {
  if (gender === null) return true;
  const tutorGender = normalizeGender(tutor.Gender);
  if (tutorGender === null) return true; // If tutor gender is not specified, include
  return tutorGender === gender;
};

const matchesSchoolExperience = (tutor: TutorProfile, minYears: number | null): boolean => {
  if (minYears === null) return true;
  const tutorExp = parseSchoolExperience(tutor['School Exp.']);
  if (tutorExp === null) return true; // If not specified, include
  return tutorExp >= minYears;
};

const matchesVehicle = (tutor: TutorProfile, hasVehicleFilter: boolean | null): boolean => {
  if (hasVehicleFilter === null) return true;
  const tutorHasVehicle = hasVehicle(tutor['Have own Vehicle']);
  if (tutorHasVehicle === null) return true; // If not specified, include
  return tutorHasVehicle === hasVehicleFilter;
};

const matchesLastUpdated = (tutor: TutorProfile, [startDate, endDate]: [Date, Date]): boolean => {
  const recordDate = parseRecordDate(tutor['Record Added']);
  return recordDate >= startDate && recordDate <= endDate;
};

const matchesVerification = (tutor: TutorProfile, statuses: string[]): boolean => {
  if (statuses.length === 0) return true;
  const tutorStatus = getVerificationStatus(tutor.Verified);
  return statuses.includes(tutorStatus);
};

const matchesSearchQuery = (tutor: TutorProfile, query: string): boolean => {
  if (!query.trim()) return true;
  const queryLower = query.toLowerCase();

  const searchFields = [
    tutor['Name'],
    tutor['Preferred City'],
    tutor['Preferred Subject(s)'],
    tutor['Qualification(s)'],
    tutor['Address']
  ];

  return searchFields.some(field =>
    field && field.toLowerCase().includes(queryLower)
  );
};

export const applyTutorFilters = (
  tutors: TutorProfile[],
  filters: TutorFilters
): TutorProfile[] => {
  return tutors.filter(tutor => {
    return (
      matchesCity(tutor, filters.cities) &&
      matchesSubjects(tutor, filters.subjects) &&
      matchesFeeRange(tutor, filters.feeRange) &&
      matchesTimePeriods(tutor, filters.timePeriods) &&
      matchesDays(tutor, filters.daysAvailable) &&
      matchesGender(tutor, filters.gender) &&
      matchesSchoolExperience(tutor, filters.schoolExperience) &&
      matchesVehicle(tutor, filters.hasVehicle) &&
      matchesLastUpdated(tutor, filters.lastUpdatedRange) &&
      matchesVerification(tutor, filters.verificationStatus) &&
      matchesSearchQuery(tutor, filters.searchQuery)
    );
  });
};
