import { useEffect, useState } from "react";

/**
 * Safely parse JSON values. Returns fallback if parsing fails.
 * @param {string | null} value
 * @param {any} fallback
 * @returns {any}
 */
function safeJsonParse(value, fallback) {
  if (value == null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Create a stable storage key namespace for the app.
 * @param {string} key
 * @returns {string}
 */
function namespacedKey(key) {
  return `retro-notes::${key}`;
}

// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  /**
   * A React hook that mirrors a state value into localStorage.
   *
   * - Loads initial value from localStorage on first render.
   * - Writes updates to localStorage whenever state changes.
   *
   * @param {string} key localStorage key (will be namespaced)
   * @param {any} initialValue fallback value when storage is empty/invalid
   * @returns {[any, Function]} tuple of [value, setValue]
   */
  const storageKey = namespacedKey(key);

  const [value, setValue] = useState(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw == null) return initialValue;
    return safeJsonParse(raw, initialValue);
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}
