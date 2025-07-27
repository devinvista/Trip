// Utility functions for trip-related calculations

export interface TripParticipant {
  id: number;
  user_id: number;
  status: 'accepted' | 'pending' | 'rejected';
  joined_at: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    profilePhoto?: string;
  };
}

export interface Trip {
  id: number;
  current_participants?: number;
  max_participants?: number;
  participants?: TripParticipant[];
  start_date?: string;
  end_date?: string;
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
  // Fallback to current_participants field
  return trip.current_participants || 1;
}

/**
 * Calculates available spots in a trip
 */
export function getAvailableSpots(trip: Trip): number {
  const currentCount = getRealParticipantsCount(trip);
  const maxParticipants = trip.max_participants || 1;
  return Math.max(0, maxParticipants - currentCount);
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
  const maxParticipants = trip.max_participants || 1;
  return maxParticipants > 0 ? (currentCount / maxParticipants) * 100 : 0;
}

/**
 * Determines if a trip has started based on start date
 */
export function hasTripStarted(trip: Trip): boolean {
  if (!trip.start_date) return false;
  const startDate = new Date(trip.start_date);
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
  return trip.max_participants || 1;
}