// https://usehooks.com/useLocalStorage/
import { useState } from 'react';
import { STORAGE_KEY_PREFIX } from 'toolkit/extension/utils/toolkit';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
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
  const setValue = (value: T | ((storedValue: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      let localStorageKey = `${STORAGE_KEY_PREFIX}${key}`;
      window.localStorage.setItem(localStorageKey, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
