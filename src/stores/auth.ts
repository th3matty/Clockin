import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import type { 
  AuthUser, 
  User, 
  LoginCredentials, 
  SignupCredentials,
  DetailedApiResponse 
} from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEmployee = computed(() => user.value?.role === 'employee')
  const userRole = computed(() => user.value?.role || null)

  // Actions
  async function initialize() {
    if (initialized.value) return

    try {
      loading.value = true
      error.value = null

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        initialized.value = true
        return
      }

      if (session?.user && !user.value) {
        // Only load profile if we don't already have user data
        const success = await loadUserProfile(session.user.id)
        
        // Load theme preference after successful profile load
        if (success && user.value?.theme_preference) {
          const { useThemeStore } = await import('./theme')
          const themeStore = useThemeStore()
          themeStore.setTheme(user.value.theme_preference)
        }
      }

      // Listen for auth changes (only set up once)
      if (!initialized.value) {
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change:', event, session?.user?.id)
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Only load profile if we don't already have it or it's different user
            if (!user.value || user.value.id !== session.user.id) {
              const success = await loadUserProfile(session.user.id)
              
              // Load theme preference after successful profile load
              if (success && user.value?.theme_preference) {
                const { useThemeStore } = await import('./theme')
                const themeStore = useThemeStore()
                themeStore.setTheme(user.value.theme_preference)
              }
            }
          } else if (event === 'SIGNED_OUT') {
            user.value = null
          }
        })
      }

      initialized.value = true
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = 'Failed to initialize authentication'
      initialized.value = true // Mark as initialized even on error to prevent infinite loops
    } finally {
      loading.value = false
    }
  }

  async function loadUserProfile(userId: string): Promise<boolean> {
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Profile loading error:', profileError)
        return false
      }

      if (data) {
        user.value = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          avatar_url: data.avatar_url,
          default_start_time: data.default_start_time,
          default_lunch_minutes: data.default_lunch_minutes,
          default_end_time: data.default_end_time,
          holiday_allowance: data.holiday_allowance,
          weekly_target_hours: data.weekly_target_hours,
          working_days_per_week: data.working_days_per_week,
          overtime_balance: data.overtime_balance,
          theme_preference: data.theme_preference
        }
        return true
      }
      return false
    } catch (err) {
      console.error('Profile loading exception:', err)
      return false
    }
  }

  async function login(credentials: LoginCredentials): Promise<DetailedApiResponse<AuthUser>> {
    try {
      loading.value = true
      error.value = null

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 10000) // 10 second timeout
      })

      const loginPromise = supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      const { data, error: authError } = await Promise.race([loginPromise, timeoutPromise]) as any

      if (authError) {
        error.value = authError.message
        return {
          data: null,
          error: {
            message: authError.message,
            code: authError.status
          },
          loading: false,
          success: false
        }
      }

      if (data.user) {
        // Load user profile with timeout
        const profilePromise = loadUserProfile(data.user.id)
        const profileTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile loading timeout')), 5000)
        })

        try {
          await Promise.race([profilePromise, profileTimeoutPromise])
        } catch (profileError) {
          console.error('Profile loading failed:', profileError)
          // Continue anyway - the auth state change handler will retry
        }

        // Ensure user is set before returning
        if (!user.value) {
          // Fallback: create minimal user object from auth data
          user.value = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || '',
            role: data.user.user_metadata?.role || 'employee'
          } as AuthUser
        }
      }

      return {
        data: user.value,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      error.value = errorMessage
      
      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  async function signup(credentials: SignupCredentials): Promise<DetailedApiResponse<AuthUser>> {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
            role: credentials.role || 'employee'
          }
        }
      })

      if (authError) {
        error.value = authError.message
        return {
          data: null,
          error: {
            message: authError.message,
            code: authError.status
          },
          loading: false,
          success: false
        }
      }

      // Note: User profile will be created automatically by the database trigger
      // We'll load it when the user confirms their email and signs in

      return {
        data: null, // User needs to confirm email first
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      error.value = errorMessage
      
      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // Add timeout to prevent hanging logout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Logout timeout')), 5000) // 5 second timeout
      })

      const logoutPromise = supabase.auth.signOut()

      const { error: signOutError } = await Promise.race([logoutPromise, timeoutPromise]) as any
      
      if (signOutError) {
        error.value = signOutError.message
        // Still clear user even if logout fails
        user.value = null
        return
      }

      user.value = null
    } catch (err) {
      error.value = 'Failed to logout'
      // Force clear user state even if logout fails
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Partial<User>): Promise<DetailedApiResponse<User>> {
    if (!user.value) {
      return {
        data: null,
        error: { message: 'Not authenticated' },
        loading: false,
        success: false
      }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return {
          data: null,
          error: {
            message: updateError.message,
            code: updateError.code
          },
          loading: false,
          success: false
        }
      }

      // Update local user state
      if (data) {
        user.value = {
          ...user.value,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          default_start_time: data.default_start_time,
          default_lunch_minutes: data.default_lunch_minutes,
          default_end_time: data.default_end_time,
          holiday_allowance: data.holiday_allowance,
          weekly_target_hours: data.weekly_target_hours,
          working_days_per_week: data.working_days_per_week,
          overtime_balance: data.overtime_balance,
          theme_preference: data.theme_preference
        }
      }

      return {
        data: data,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      error.value = errorMessage
      
      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    initialized: readonly(initialized),
    
    // Getters
    isAuthenticated,
    isAdmin,
    isEmployee,
    userRole,
    
    // Actions
    initialize,
    login,
    signup,
    logout,
    updateProfile,
    clearError
  }
})

// Helper function to get readonly refs
function readonly<T>(ref: any) {
  return computed(() => ref.value)
}