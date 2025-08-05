import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import { supabase } from '@/utils/supabase'
import type { DetailedApiResponse } from '@/types'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<Theme>('system')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isDark = computed(() => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const currentTheme = computed(() => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme.value
  })

  // Actions
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    applyTheme()
    
    // Save to localStorage for immediate persistence
    localStorage.setItem('theme', newTheme)
  }

  function applyTheme() {
    const root = document.documentElement
    
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  function toggleTheme() {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  async function saveThemeToDatabase(userId: string): Promise<DetailedApiResponse<boolean>> {
    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase
        .from('users')
        .update({ theme_preference: theme.value })
        .eq('id', userId)

      if (updateError) {
        error.value = updateError.message
        return {
          data: false,
          error: {
            message: updateError.message,
            code: updateError.code
          },
          loading: false,
          success: false
        }
      }

      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save theme preference'
      error.value = errorMessage
      
      return {
        data: false,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  async function loadThemeFromDatabase(userId: string): Promise<DetailedApiResponse<Theme>> {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('theme_preference')
        .eq('id', userId)
        .single()

      if (fetchError) {
        error.value = fetchError.message
        return {
          data: 'system',
          error: {
            message: fetchError.message,
            code: fetchError.code
          },
          loading: false,
          success: false
        }
      }

      const userTheme = (data?.theme_preference as Theme) || 'system'
      setTheme(userTheme)

      return {
        data: userTheme,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load theme preference'
      error.value = errorMessage
      
      return {
        data: 'system',
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  function initializeTheme() {
    // Load from localStorage first for immediate application
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      theme.value = savedTheme
    }
    
    // Apply theme immediately
    applyTheme()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    })
  }

  function clearError() {
    error.value = null
  }

  // Watch theme changes to apply them
  watch(theme, () => {
    applyTheme()
  })

  return {
    // State (readonly for external access)
    theme: readonly(theme),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    isDark,
    currentTheme,
    
    // Actions
    setTheme,
    toggleTheme,
    saveThemeToDatabase,
    loadThemeFromDatabase,
    initializeTheme,
    clearError
  }
})