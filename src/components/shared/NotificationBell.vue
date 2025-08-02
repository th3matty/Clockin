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
          @click="markAllAsRead"
          class="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          Mark all read
        </button>
      </div>

      <!-- Notifications List -->
      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="px-4 py-8 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6.334c-.706 0-1.334-.895-1.334-2V9c0-3.866 3.582-7 8-7s8 3.134 8 7v8c0 1.105-.628 2-1.334 2H15" />
          </svg>
          <p class="text-sm text-gray-500">No notifications yet</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
              !notification.read ? 'bg-blue-50' : ''
            ]"
            @click="markAsRead(notification.id)"
          >
            <div class="flex items-start space-x-3">
              <!-- Notification Icon -->
              <div
                :class="[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  getNotificationColor(notification.type)
                ]"
              >
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="notification.type === 'holiday_request'" fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  <path v-else-if="notification.type === 'holiday_approved'" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>

              <!-- Notification Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">{{ formatTime(notification.created_at) }}</span>
                    <div
                      v-if="!notification.read"
                      class="w-2 h-2 bg-blue-500 rounded-full"
                    ></div>
                  </div>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
              </div>
            </div>
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { Notification, NotificationType } from '@/types'

// Composables
const { user } = useAuth()

// State
const showNotifications = ref(false)
const notifications = ref<Notification[]>([
  // Mock notifications for now - will be replaced with real data in later tasks
  {
    id: '1',
    user_id: user.value?.id || '',
    type: 'holiday_approved',
    title: 'Holiday Request Approved',
    message: 'Your holiday request for Dec 25-26 has been approved.',
    read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: '2',
    user_id: user.value?.id || '',
    type: 'holiday_request',
    title: 'New Holiday Request',
    message: 'John Doe has requested 3 days of holiday.',
    read: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
])

// Computed
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

// Methods
function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'holiday_approved':
      return 'bg-green-500'
    case 'holiday_denied':
      return 'bg-red-500'
    case 'holiday_request':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

function markAsRead(notificationId: string) {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

function markAllAsRead() {
  notifications.value.forEach(notification => {
    notification.read = true
  })
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

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>