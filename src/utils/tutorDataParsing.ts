import { TutorProfile } from '../types';

export const extractSubjects = (str: string | undefined): string[] => {
  if (!str) return [];
  return str
    .split(/[,;|]/)
    .map(s => s.trim())
    .filter(s => s && s !== 'null' && s !== '');
};

export const extractTimePeriods = (str: string | undefined): string[] => {
  if (!str) return [];

  const timeStr = str.toLowerCase();
  const periods = new Set<string>();

  // Morning times
  if (timeStr.match(/6\s*(?:am|a\.m\.)|7\s*(?:am|a\.m\.)|8\s*(?:am|a\.m\.)|9\s*(?:am|a\.m\.)|10\s*(?:am|a\.m\.)|morning/i)) {
    periods.add('Morning');
  }

  // Afternoon times
  if (timeStr.match(/12\s*(?:pm|p\.m\.)|1\s*(?:pm|p\.m\.)|2\s*(?:pm|p\.m\.)|3\s*(?:pm|p\.m\.)|4\s*(?:pm|p\.m\.)|afternoon/i)) {
    periods.add('Afternoon');
  }

  // Evening times
  if (timeStr.match(/5\s*(?:pm|p\.m\.)|6\s*(?:pm|p\.m\.)|7\s*(?:pm|p\.m\.)|8\s*(?:pm|p\.m\.)|9\s*(?:pm|p\.m\.)|10\s*(?:pm|p\.m\.)|11\s*(?:pm|p\.m\.)|evening|night/i)) {
    periods.add('Evening');
  }

  return Array.from(periods);
};

export const extractDaysFromTeachingMode = (str: string | undefined): string[] => {
  if (!str) return [];

  const daysRegex = /monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi;
  const matches = str.match(daysRegex) || [];

  return [
    ...new Set(
      matches.map(d => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())
    )
  ];
};

export const parseFeeToNumber = (str: string | undefined): number => {
  if (!str) return 0;

  // Extract first number (handle ₹300-500, ₹300, etc.)
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const parseSchoolExperience = (str: string | undefined): number | null => {
  if (!str) return null;

  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

export const parseRecordDate = (dateStr: string | undefined): Date => {
  if (!dateStr) return new Date(2020, 0, 1);

  try {
    // Handle format: "2024-04-28 14:23:00"
    return new Date(dateStr.replace(' ', 'T'));
  } catch {
    return new Date(2020, 0, 1);
  }
};

export const getVerificationStatus = (verified: string | undefined): 'Verified' | 'Unverified' => {
  if (!verified) return 'Unverified';
  return verified.toString().toLowerCase().trim() === 'yes' ? 'Verified' : 'Unverified';
};

export const hasVehicle = (vehicleStr: string | undefined): boolean | null => {
  if (!vehicleStr) return null;
  const lower = vehicleStr.toString().toLowerCase().trim();
  if (lower === 'yes') return true;
  if (lower === 'no') return false;
  return null;
};

export const normalizeGender = (gender: string | undefined): string | null => {
  if (!gender) return null;
  const lower = gender.toLowerCase().trim();
  if (lower.includes('male') && !lower.includes('female')) return 'Male';
  if (lower.includes('female')) return 'Female';
  return null;
};

export const getCityFromTutor = (tutor: TutorProfile): string => {
  return tutor['Preferred City'] || 'Other';
};

export const getLocationString = (tutor: TutorProfile): string => {
  return tutor['Preferred Location(s)'] || tutor['Preferred City'] || 'India';
};
