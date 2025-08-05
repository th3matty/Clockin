import { storeToRefs } from 'pinia'
import { useThemeStore, type Theme } from '@/stores/theme'

export function useTheme() {
  const store = useThemeStore()
  
  // Use storeToRefs to maintain reactivity for state/getters
  const { theme, loading, error, isDark, currentTheme } = storeToRefs(store)
  
  // Actions don't need storeToRefs
  const { 
    setTheme, 
    toggleTheme, 
    saveThemeToDatabase, 
    loadThemeFromDatabase, 
    initializeTheme, 
    clearError 
  } = store

  // Utility functions
  function getThemeIcon(themeValue: Theme): string {
    switch (themeValue) {
      case 'light':
        return 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
      case 'dark':
        return 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
      case 'system':
        return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      default:
        return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    }
  }

  function getThemeLabel(themeValue: Theme): string {
    switch (themeValue) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'System'
    }
  }

  return {
    // Reactive state/getters
    theme,
    loading,
    error,
    isDark,
    currentTheme,
    
    // Actions
    setTheme,
    toggleTheme,
    saveThemeToDatabase,
    loadThemeFromDatabase,
    initializeTheme,
    clearError,
    
    // Utility functions
    getThemeIcon,
    getThemeLabel
  }
}