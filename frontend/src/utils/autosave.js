/**
 * Autosave utility for form drafts
 * Provides debounced localStorage persistence and restore functionality
 */

export const createAutosaveManager = (storageKey, initialData) => {
  let debounceTimer = null;

  const save = (data) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new debounce timer (500ms)
    debounceTimer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to autosave draft:', error);
      }
    }, 500);
  };

  const restore = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to restore autosaved draft:', error);
      return null;
    }
  };

  const clear = () => {
    try {
      localStorage.removeItem(storageKey);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    } catch (error) {
      console.error('Failed to clear autosaved draft:', error);
    }
  };

  const exists = () => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      return false;
    }
  };

  return {
    save,
    restore,
    clear,
    exists,
  };
};
