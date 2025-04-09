/**
 * Format date string consistently across the application
 * @param dateString ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (Month Day, Year)
 */
export function formatDate(dateString: string): string {
  // Simple date formatter that doesn't use the Date object at all
  // This prevents any timezone conversions
  const [year, month, day] = dateString.split('-');
  
  // Convert month number to name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Parse month as integer and subtract 1 to get the correct index
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = monthNames[monthIndex];
  
  // Remove leading zero from day if present
  const dayFormatted = day.startsWith('0') ? day.substring(1) : day;
  
  // Return formatted date string
  return `${monthName} ${dayFormatted}, ${year}`;
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentISODate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current datetime in ISO format
 */
export function getCurrentISODateTime(): string {
  return new Date().toISOString();
} 