/**
 * Centralized error handling utility
 */

import { writable } from 'svelte/store';

// Enum for error severity levels
export enum ErrorSeverity {
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error data structure
export interface ErrorData {
  id: string;
  message: string;
  details?: string;
  severity: ErrorSeverity;
  timestamp: number;
  source?: string;
}

// Create a Svelte store for errors
export const errorStore = writable<ErrorData[]>([]);

// Optional: limit how many errors we keep in the store
const MAX_ERRORS = 10;

/**
 * Central error handling function
 * 
 * @param message User-friendly error message
 * @param error Original error object (optional)
 * @param severity Error severity level (default: ERROR)
 * @param source Source of the error (e.g., 'interactionService')
 */
export function handleError(
  message: string,
  error?: any,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  source?: string
): void {
  // Generate a unique error ID
  const id = Date.now().toString();
  
  // Extract error details if available
  let details: string | undefined;
  if (error) {
    details = error instanceof Error ? error.message : String(error);
    // Log to console for developers
    console.error(`${message}: ${details}`, error);
  }
  
  // Create error data object
  const errorData: ErrorData = {
    id,
    message,
    details,
    severity,
    timestamp: Date.now(),
    source
  };
  
  // Add to store
  errorStore.update(errors => {
    // Add new error to the beginning
    const updatedErrors = [errorData, ...errors];
    // Limit number of errors stored
    return updatedErrors.slice(0, MAX_ERRORS);
  });
  
  // Additional logic for critical errors (e.g., send to monitoring service)
  if (severity === ErrorSeverity.CRITICAL) {
    // This could be expanded to integrate with error monitoring services
    console.error('CRITICAL ERROR:', errorData);
  }
}

/**
 * Clear all errors from the store
 */
export function clearErrors(): void {
  errorStore.set([]);
}

/**
 * Remove a specific error by ID
 */
export function dismissError(id: string): void {
  errorStore.update(errors => errors.filter(error => error.id !== id));
}
