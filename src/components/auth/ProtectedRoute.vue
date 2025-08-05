<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Access denied -->
    <div v-else-if="!canAccess" class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center max-w-md mx-auto">
        <div class="mb-6">
          <svg class="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p class="text-gray-600 mb-6">
            {{ accessDeniedMessage }}
          </p>
          <div class="space-y-3">
            <button @click="redirectToAppropriateRoute"
              class="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
              Go to Dashboard
            </button>
            <button @click="handleLogout"
              class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Render content if access is allowed -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { UserRole } from '@/types'

interface Props {
  requireAuth?: boolean
  requireRole?: UserRole
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  requireAuth: true,
  requireRole: undefined,
  redirectTo: '/login'
})

// Composables
const {
  isAuthenticated,
  userRole,
  loading,
  initialize,
  logout
} = useAuth()
const router = useRouter()

// Computed
const canAccess = computed(() => {
  // If auth is not required, allow access
  if (!props.requireAuth) return true

  // If auth is required but user is not authenticated
  if (!isAuthenticated.value) return false

  // If specific role is required
  if (props.requireRole && userRole.value !== props.requireRole) {
    return false
  }

  return true
})

const accessDeniedMessage = computed(() => {
  if (!isAuthenticated.value) {
    return 'You need to sign in to access this page.'
  }

  if (props.requireRole && userRole.value !== props.requireRole) {
    const requiredRoleText = props.requireRole === 'admin' ? 'administrator' : 'employee'
    const currentRoleText = userRole.value === 'admin' ? 'administrator' : 'employee'
    return `This page requires ${requiredRoleText} access. You are currently signed in as ${currentRoleText}.`
  }

  return 'You do not have permission to access this page.'
})

// Methods
function redirectToAppropriateRoute() {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  // Redirect based on user role
  const dashboardPath = userRole.value === 'admin' ? '/admin' : '/employee'
  router.push(dashboardPath)
}

async function handleLogout() {
  await logout()
}

// Watchers
watch(
  () => [isAuthenticated.value, userRole.value, loading.value],
  ([authenticated, role, isLoading]) => {
    // Don't redirect while loading
    if (isLoading) return

    // If auth is required but user is not authenticated, redirect to login
    if (props.requireAuth && !authenticated) {
      router.push(props.redirectTo)
      return
    }

    // If specific role is required and user doesn't have it, redirect to appropriate dashboard
    if (authenticated && props.requireRole && role !== props.requireRole) {
      const dashboardPath = role === 'admin' ? '/admin' : '/employee'
      router.push(dashboardPath)
      return
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(async () => {
  await initialize()
})
</script>