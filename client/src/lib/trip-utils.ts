// Utility functions for trip-related calculations

export interface TripParticipant {
  id: number;
  userId: number;
  status: 'accepted' | 'pending' | 'rejected';
  joinedAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    profilePhoto?: string;
  };
}

export interface Trip {
  id: number;
  currentParticipants: number;
  maxParticipants: number;
  participants?: TripParticipant[];
  [key: string]: any;
}

/**
 * Calculates the real number of participants in a trip
 * Always counts only accepted participants from the participants array if available,
 * otherwise falls back to currentParticipants field (which should be kept in sync)
 */
export function getRealParticipantsCount(trip: Trip): number {
  if (trip.participants && Array.isArray(trip.participants)) {
    // Always prioritize counting accepted participants from the participants array
    return trip.participants.filter(p => p.status === 'accepted').length;
  }
  // Fallback to currentParticipants field only when participants array is not available
  return trip.currentParticipants || 1;
}

/**
 * Calculates available spots in a trip
 */
export function getAvailableSpots(trip: Trip): number {
  const currentCount = getRealParticipantsCount(trip);
  return Math.max(0, trip.maxParticipants - currentCount);
}

/**
 * Checks if a trip is full (no available spots)
 */
export function isTripFull(trip: Trip): boolean {
  return getAvailableSpots(trip) === 0;
}

/**
 * Calculates occupancy percentage
 */
export function getTripOccupancy(trip: Trip): number {
  const currentCount = getRealParticipantsCount(trip);
  return trip.maxParticipants > 0 ? (currentCount / trip.maxParticipants) * 100 : 0;
}

/**
 * Determines if a trip has started based on start date
 */
export function hasTripStarted(trip: Trip): boolean {
  if (!trip.startDate) return false;
  const startDate = new Date(trip.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only dates
  startDate.setHours(0, 0, 0, 0);
  return startDate <= today;
}

/**
 * Gets the appropriate participant count for budget calculations
 * Before trip starts: use maxParticipants (planning phase)
 * After trip starts: use real participants (execution phase)
 */
export function getParticipantsForBudgetCalculation(trip: Trip): number {
  if (hasTripStarted(trip)) {
    return getRealParticipantsCount(trip);
  }
  return trip.maxParticipants || 1;
}