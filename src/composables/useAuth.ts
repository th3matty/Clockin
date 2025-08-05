import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials, SignupCredentials, UserRole } from '@/types'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const isEmployee = computed(() => authStore.isEmployee)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)
  const userRole = computed(() => authStore.userRole)

  // Authentication methods
  async function login(credentials: LoginCredentials) {
    const result = await authStore.login(credentials)

    if (result.success && result.data) {
      // Wait a bit for the auth state to settle
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Ensure user is properly set before navigation
      if (authStore.user) {
        const redirectPath = authStore.user.role === 'admin' ? '/admin' : '/employee'
        await router.push(redirectPath)
      }
    }

    return result
  }

  async function signup(credentials: SignupCredentials) {
    const result = await authStore.signup(credentials)

    if (result.success) {
      // Redirect to login with success message
      await router.push('/login?message=Please check your email to confirm your account')
    }

    return result
  }

  async function logout() {
    await authStore.logout()
    await router.push('/login')
  }

  // Navigation helpers
  function requireAuth(): boolean {
    if (!isAuthenticated.value) {
      router.push('/login')
      return false
    }
    return true
  }

  function requireRole(role: UserRole): boolean {
    if (!requireAuth()) return false

    if (userRole.value !== role) {
      // Redirect to appropriate dashboard
      const redirectPath = userRole.value === 'admin' ? '/admin' : '/employee'
      router.push(redirectPath)
      return false
    }

    return true
  }

  function requireAdmin(): boolean {
    return requireRole('admin')
  }

  function requireEmployee(): boolean {
    return requireRole('employee')
  }

  // Route guards
  function canAccess(requiredRole?: UserRole): boolean {
    if (!isAuthenticated.value) return false
    if (!requiredRole) return true
    return userRole.value === requiredRole
  }

  // Initialization
  async function initialize() {
    if (!authStore.initialized) {
      await authStore.initialize()
    }
  }

  // Utility methods
  function clearError() {
    authStore.clearError()
  }

  function hasRole(role: UserRole): boolean {
    return userRole.value === role
  }

  function isCurrentUser(userId: string): boolean {
    return user.value?.id === userId
  }

  // Profile management
  async function updateProfile(updates: any) {
    return await authStore.updateProfile(updates)
  }

  return {
    // State
    user,
    isAuthenticated,
    isAdmin,
    isEmployee,
    loading,
    error,
    userRole,

    // Methods
    login,
    signup,
    logout,
    initialize,
    clearError,
    updateProfile,

    // Navigation helpers
    requireAuth,
    requireRole,
    requireAdmin,
    requireEmployee,
    canAccess,
    hasRole,
    isCurrentUser
  }
}