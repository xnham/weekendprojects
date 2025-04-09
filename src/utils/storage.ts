/**
 * Get item from localStorage with type safety
 * @param key localStorage key
 * @param defaultValue Default value if key doesn't exist
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

/**
 * Save item to localStorage
 * @param key localStorage key
 * @param value Value to store
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

/**
 * Remove item from localStorage
 * @param key localStorage key
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${key} from localStorage:`, e);
  }
} 