<template>
  <div
    :class="[
      'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
      !notification.read ? 'bg-blue-50' : ''
    ]"
    @click="$emit('markAsRead', notification.id)"
  >
    <div class="flex items-start space-x-3">
      <!-- Notification Icon -->
      <div
        :class="[
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          iconColor
        ]"
      >
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path :d="iconPath" fill-rule="evenodd" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Notification Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">{{ formattedTime }}</span>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import type { Notification } from '@/types'

// Props
interface Props {
  notification: Notification
}

const props = defineProps<Props>()

// Emits
defineEmits<{
  markAsRead: [id: string]
}>()

// Composables
const { getNotificationColor, getNotificationIcon, formatTime } = useNotifications()

// Computed
const iconColor = computed(() => getNotificationColor(props.notification.type))
const iconPath = computed(() => getNotificationIcon(props.notification.type))
const formattedTime = computed(() => formatTime(props.notification.created_at))
</script>