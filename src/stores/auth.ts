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
        return
      }

      if (session?.user) {
        await loadUserProfile(session.user.id)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
        }
      })

      initialized.value = true
    } catch (err) {
      error.value = 'Failed to initialize authentication'
    } finally {
      loading.value = false
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        return
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
          weekly_target_hours: data.weekly_target_hours
        }
      }
    } catch (err) {
      // Handle error silently
    }
  }

  async function login(credentials: LoginCredentials): Promise<DetailedApiResponse<AuthUser>> {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
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

      if (data.user) {
        await loadUserProfile(data.user.id)
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

      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        error.value = signOutError.message
        return
      }

      user.value = null
    } catch (err) {
      error.value = 'Failed to logout'
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
          weekly_target_hours: data.weekly_target_hours
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