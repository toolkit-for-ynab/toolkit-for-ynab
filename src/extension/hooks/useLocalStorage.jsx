// https://usehooks.com/useLocalStorage/
import { useState } from 'react';

const STORAGE_KEY_PREFIX = 'ynab-toolkit-';
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    // Get the saved value if any, otherwise use the initial value
    try {
      let localStorageKey = `${STORAGE_KEY_PREFIX}${key}`;
      const item = window.localStorage.getItem(localStorageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Wrapper function around setStoredValue to save into Local Storage
  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      let localStorageKey = `${STORAGE_KEY_PREFIX}${key}`;
      window.localStorage.setItem(localStorageKey, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
