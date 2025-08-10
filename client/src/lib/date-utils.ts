/**
 * Utility functions for safe date handling throughout the application
 */

/**
 * Safely parses a date string and returns a valid Date object
 * @param dateInput - Date string or Date object
 * @param fallback - Fallback date if parsing fails (default: current date)
 * @returns Valid Date object
 */
export function safeParseDate(dateInput: string | Date | null | undefined, fallback?: Date): Date {
  try {
    if (!dateInput) {
      return fallback || new Date();
    }
    
    const parsed = new Date(dateInput);
    
    // Check if the date is valid
    if (isNaN(parsed.getTime())) {
      console.warn(`Invalid date input: ${dateInput}`);
      return fallback || new Date();
    }
    
    return parsed;
  } catch (error) {
    console.error(`Error parsing date: ${dateInput}`, error);
    return fallback || new Date();
  }
}

/**
 * Calculates the number of days between two dates safely
 * @param startDate - Start date
 * @param endDate - End date (default: current date)
 * @returns Number of days between dates
 */
export function safeDateDifference(startDate: string | Date, endDate: string | Date = new Date()): number {
  try {
    const start = safeParseDate(startDate);
    const end = safeParseDate(endDate);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Error calculating date difference:', error);
    return 0;
  }
}

/**
 * Checks if a date is valid
 * @param dateInput - Date to validate
 * @returns Boolean indicating if date is valid
 */
export function isValidDate(dateInput: string | Date | null | undefined): boolean {
  if (!dateInput) return false;
  
  try {
    const parsed = new Date(dateInput);
    return !isNaN(parsed.getTime());
  } catch {
    return false;
  }
}

/**
 * Gets days until a specific date from now
 * @param targetDate - Target date
 * @returns Number of days until target date (negative if past)
 */
export function getDaysUntilDate(targetDate: string | Date): number {
  try {
    const target = safeParseDate(targetDate);
    const today = new Date();
    
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days until date:', error);
    return 0;
  }
}

/**
 * Calculates trip duration safely
 * @param startDate - Trip start date
 * @param endDate - Trip end date
 * @returns Duration in days (minimum 1)
 */
export function getTripDuration(startDate: string | Date, endDate: string | Date): number {
  try {
    const start = safeParseDate(startDate);
    const end = safeParseDate(endDate);
    
    const diffTime = end.getTime() - start.getTime();
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Ensure minimum duration of 1 day
    return Math.max(1, duration);
  } catch (error) {
    console.error('Error calculating trip duration:', error);
    return 1;
  }
}