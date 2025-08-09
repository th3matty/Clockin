<template>
  <div class="relative">
    <!-- Notification Bell Button -->
    <button @click="toggleNotifications"
      class="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
      <Vue3Lottie :animationData="notificationAnimation" :height="24" :width="24" :loop="true"
        :autoPlay="unreadCount > 0" ref="notificationLottieRef"
        :style="{ filter: isDarkMode ? 'invert(1) brightness(0.8)' : 'none' }" />

      <!-- Notification Badge -->
      <span v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown Panel -->
    <div v-if="showNotifications"
      class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        <button v-if="unreadCount > 0" @click="handleMarkAllAsRead" :disabled="loading"
          class="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50">
          Mark all read
        </button>
      </div>

      <!-- Notifications List -->
      <div class="max-h-80 overflow-y-auto custom-scrollbar">
        <!-- Loading State -->
        <div v-if="loading" class="px-4 py-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-5 5v-5zM11 19H6.334c-.706 0-1.334-.895-1.334-2V9c0-3.866 3.582-7 8-7s8 3.134 8 7v8c0 1.105-.628 2-1.334 2H15" />
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="divide-y divide-gray-100">
          <NotificationItem v-for="notification in notifications" :key="notification.id" :notification="notification"
            @mark-as-read="handleMarkAsRead" @navigate-to-calendar="handleNavigateToCalendar" />
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 0"
        class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <button @click="viewAllNotifications"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View all notifications
        </button>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div v-if="showNotifications" @click="showNotifications = false" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import NotificationItem from './NotificationItem.vue'
import { Vue3Lottie } from 'vue3-lottie'
import notificationAnimationData from '@/assets/notification-V3.json'

// Composables
const { user } = useAuth()
const route = useRoute()
const router = useRouter()
const {
  sortedNotifications: notifications,
  unreadCount,
  loading,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  setupRealtimeSubscription,
  clearRealtimeSubscription,
  resetLoadingState
} = useNotifications()

// State
const showNotifications = ref(false)
const notificationLottieRef = ref()
const notificationAnimation = notificationAnimationData
const refreshTimeout = ref<NodeJS.Timeout | null>(null)

// Dark mode detection
const isDarkMode = ref(false)

// Function to update dark mode state
function updateDarkMode() {
  if (typeof window !== 'undefined') {
    isDarkMode.value = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

// Debounced notification refresh function
async function refreshNotificationsDebounced() {
  // Clear existing timeout
  if (refreshTimeout.value) {
    clearTimeout(refreshTimeout.value)
  }
  
  // Set new timeout to debounce rapid navigation
  refreshTimeout.value = setTimeout(async () => {
    if (user.value && !loading.value) {
      try {
        await fetchNotifications(user.value.id)
      } catch (error) {
        console.error('Failed to refresh notifications on route change:', error)
      }
    }
  }, 500) // 500ms debounce
}

// Methods
async function toggleNotifications() {
  if (!showNotifications.value) {
    // Opening dropdown - ensure notifications are loaded
    showNotifications.value = true
    if (user.value && notifications.value.length === 0 && !loading.value) {
      try {
        await fetchNotifications(user.value.id)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        // Reset loading state if fetch fails
        resetLoadingState()
      }
    }
  } else {
    // Closing dropdown
    showNotifications.value = false
  }
}

async function handleMarkAsRead(notificationId: string) {
  await markAsRead(notificationId)
}

async function handleNavigateToCalendar(startDate: string, endDate: string) {
  // Close the notification dropdown
  showNotifications.value = false
  
  // Navigate to the employee calendar with date parameters
  await router.push({
    name: 'employee-calendar',
    query: {
      highlight: startDate,
      endDate: endDate
    }
  })
  
}

async function handleMarkAllAsRead() {
  if (user.value) {
    await markAllAsRead(user.value.id)
  }
}

function viewAllNotifications() {
  showNotifications.value = false
  // TODO: Navigate to notifications page when implemented
}

// Manual refresh function that can be called externally
async function refreshNotifications() {
  if (user.value && !loading.value) {
    try {
      await fetchNotifications(user.value.id)
    } catch (error) {
      console.error('Failed to manually refresh notifications:', error)
    }
  }
}

// Expose refresh function for external use
defineExpose({
  refreshNotifications
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showNotifications.value = false
  }
}

// Watch for user changes to set up notifications
watch(user, async (newUser, oldUser) => {
  if (newUser && newUser.id !== oldUser?.id) {
    // Clear previous subscription if exists
    clearRealtimeSubscription()

    // Set up real-time subscription first
    setupRealtimeSubscription(newUser.id)

    // Fetch initial notifications only if we don't have any
    if (notifications.value.length === 0) {
      try {
        await fetchNotifications(newUser.id)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }
  } else if (!newUser) {
    // Clear subscription when user logs out
    clearRealtimeSubscription()
  }
}, { immediate: true })

// Watch for route changes to refresh notifications
watch(() => route.path, (newPath, oldPath) => {
  // Only refresh if user is authenticated and route actually changed
  if (user.value && newPath !== oldPath) {
    refreshNotificationsDebounced()
  }
})

// Watch for unread count changes to control animation
watch(unreadCount, (newCount, oldCount) => {
  if (notificationLottieRef.value) {
    if (newCount > 0 && oldCount === 0) {
      // Start animation when we get new notifications
      notificationLottieRef.value.play()
    } else if (newCount === 0 && oldCount > 0) {
      // Stop animation when all notifications are read
      notificationLottieRef.value.stop()
    }
  }
})



// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  // Initialize dark mode detection
  updateDarkMode()

  // Watch for dark mode changes using MutationObserver
  const observer = new MutationObserver(() => {
    updateDarkMode()
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  // Also listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', updateDarkMode)
  
  // Listen for window focus to refresh notifications when user returns to tab
  const handleWindowFocus = () => {
    if (user.value && !loading.value) {
      refreshNotificationsDebounced()
    }
  }
  
  window.addEventListener('focus', handleWindowFocus)

    // Store observer and listeners for cleanup
    ; (document as any)._themeObserver = observer
    ; (document as any)._mediaQuery = mediaQuery
    ; (document as any)._focusHandler = handleWindowFocus

  // Fetch notifications immediately if user is already authenticated
  if (user.value && notifications.value.length === 0) {
    try {
      await fetchNotifications(user.value.id)
      // Also set up real-time subscription
      setupRealtimeSubscription(user.value.id)
    } catch (error) {
      console.error('Failed to fetch notifications on mount:', error)
    }
  }

  // Safety mechanism: reset loading state if it gets stuck
  setTimeout(() => {
    if (loading.value) {
      console.warn('Notifications loading state was stuck, resetting...')
      resetLoadingState()
    }
  }, 15000) // 15 second safety timeout
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearRealtimeSubscription()
  
  // Clean up refresh timeout
  if (refreshTimeout.value) {
    clearTimeout(refreshTimeout.value)
  }

  // Clean up theme observers
  if ((document as any)._themeObserver) {
    ; (document as any)._themeObserver.disconnect()
    delete (document as any)._themeObserver
  }

  if ((document as any)._mediaQuery) {
    ; (document as any)._mediaQuery.removeEventListener('change', updateDarkMode)
    delete (document as any)._mediaQuery
  }
  
  if ((document as any)._focusHandler) {
    window.removeEventListener('focus', (document as any)._focusHandler)
    delete (document as any)._focusHandler
  }
})
</script>

<style scoped>
/* Custom scrollbar styling for light and dark modes */
.custom-scrollbar {
  scrollbar-width: thin;
  /* Firefox - Light mode default */
  scrollbar-color: #d1d5db #f3f4f6; /* thumb track */
}

/* WebKit browsers (Chrome, Safari, Edge) */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: #f3f4f6; /* gray-100 */
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db; /* gray-300 */
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af; /* gray-400 */
}

/* Dark mode styles */
.dark .custom-scrollbar {
  /* Firefox - Dark mode */
  scrollbar-color: #4b5563 #1f2937; /* thumb track */
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background-color: #1f2937; /* gray-800 */
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563; /* gray-600 */
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280; /* gray-500 */
}
</style>