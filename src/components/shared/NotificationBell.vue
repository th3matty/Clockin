<template>
  <div class="relative">
    <!-- Notification Bell Button -->
    <button
      @click="toggleNotifications"
      class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6.334c-.706 0-1.334-.895-1.334-2V9c0-3.866 3.582-7 8-7s8 3.134 8 7v8c0 1.105-.628 2-1.334 2H15M9 9l3 3 3-3" />
      </svg>
      
      <!-- Notification Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown Panel -->
    <div
      v-if="showNotifications"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900">Notifications</h3>
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllAsRead"
          :disabled="loading"
          class="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>

      <!-- Notifications List -->
      <div class="max-h-80 overflow-y-auto">
        <!-- Loading State -->
        <div v-if="loading" class="px-4 py-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p class="text-sm text-gray-500">Loading notifications...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6.334c-.706 0-1.334-.895-1.334-2V9c0-3.866 3.582-7 8-7s8 3.134 8 7v8c0 1.105-.628 2-1.334 2H15" />
          </svg>
          <p class="text-sm text-gray-500">No notifications yet</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="divide-y divide-gray-100">
          <NotificationItem
            v-for="notification in notifications"
            :key="notification.id"
            :notification="notification"
            @mark-as-read="handleMarkAsRead"
          />
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 0" class="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          @click="viewAllNotifications"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all notifications
        </button>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div
      v-if="showNotifications"
      @click="showNotifications = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import NotificationItem from './NotificationItem.vue'

// Composables
const { user } = useAuth()
const {
  sortedNotifications: notifications,
  unreadCount,
  loading,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  setupRealtimeSubscription,
  clearRealtimeSubscription,
  getNotificationColor,
  getNotificationIcon,
  formatTime
} = useNotifications()

// State
const showNotifications = ref(false)

// Methods
function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

async function handleMarkAsRead(notificationId: string) {
  await markAsRead(notificationId)
}

async function handleMarkAllAsRead() {
  if (user.value) {
    await markAllAsRead(user.value.id)
  }
}

function viewAllNotifications() {
  showNotifications.value = false
  // TODO: Navigate to notifications page when implemented
  console.log('Navigate to notifications page')
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showNotifications.value = false
  }
}

// Watch for user changes to set up notifications
watch(user, async (newUser) => {
  if (newUser) {
    // Fetch initial notifications
    await fetchNotifications(newUser.id)
    
    // Set up real-time subscription
    setupRealtimeSubscription(newUser.id)
  } else {
    // Clear subscription when user logs out
    clearRealtimeSubscription()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearRealtimeSubscription()
})
</script>