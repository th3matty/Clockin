<template>
  <div
    :class="[
      'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer',
      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
    ]"
    @click="handleNotificationClick"
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
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ notification.title }}</p>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ formattedTime }}</span>
            <div
              v-if="!notification.read"
              class="w-2 h-2 bg-blue-500 rounded-full"
            ></div>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ formattedMessage }}</p>
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
const emit = defineEmits<{
  'mark-as-read': [id: string]
  'navigate-to-calendar': [startDate: string, endDate: string]
}>()

// Composables
const { getNotificationColor, getNotificationIcon, formatTime } = useNotifications()

// Computed
const iconColor = computed(() => getNotificationColor(props.notification.type))
const iconPath = computed(() => getNotificationIcon(props.notification.type))
const formattedTime = computed(() => formatTime(props.notification.created_at))
const formattedMessage = computed(() => formatMessageDates(props.notification.message))

// Methods
function handleNotificationClick() {
  
  // Mark as read first
  emit('mark-as-read', props.notification.id)
  
  // Handle special navigation for holiday notifications
  if (props.notification.type === 'holiday_approved' || props.notification.type === 'holiday_denied' || props.notification.type === 'holiday_request') {
    const dates = extractDatesFromMessage(props.notification.message)
    if (dates) {
      emit('navigate-to-calendar', dates.startDate, dates.endDate)
    }
  }
}

function extractDatesFromMessage(message: string): { startDate: string; endDate: string } | null {
  
  // Try ISO format first (YYYY-MM-DD)
  // Example: "Your holiday request for 2025-08-11 to 2025-08-15 has been approved."
  const isoRangeRegex = /(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/
  const isoSingleRegex = /(\d{4}-\d{2}-\d{2})/
  
  let rangeMatch = message.match(isoRangeRegex)
  if (rangeMatch) {
    return {
      startDate: rangeMatch[1],
      endDate: rangeMatch[2]
    }
  }
  
  // Try German format (DD.MM.YYYY)
  // Example: "Your holiday request for 25.08.2025 - 28.08.2025 has been approved."
  const germanRangeRegex = /(\d{2}\.\d{2}\.\d{4})\s*-\s*(\d{2}\.\d{2}\.\d{4})/
  const germanSingleRegex = /(\d{2}\.\d{2}\.\d{4})/
  
  rangeMatch = message.match(germanRangeRegex)
  if (rangeMatch) {
    return {
      startDate: convertGermanDateToISO(rangeMatch[1]),
      endDate: convertGermanDateToISO(rangeMatch[2])
    }
  }
  
  // Try single ISO date
  const isoSingleMatch = message.match(isoSingleRegex)
  if (isoSingleMatch) {
    return {
      startDate: isoSingleMatch[1],
      endDate: isoSingleMatch[1]
    }
  }
  
  // Try single German date
  const germanSingleMatch = message.match(germanSingleRegex)
  if (germanSingleMatch) {
    const date = convertGermanDateToISO(germanSingleMatch[1])
    return {
      startDate: date,
      endDate: date
    }
  }
  
  return null
}

function convertGermanDateToISO(germanDate: string): string {
  // Convert DD.MM.YYYY to YYYY-MM-DD
  const [day, month, year] = germanDate.split('.')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function convertISOToGerman(isoDate: string): string {
  // Convert YYYY-MM-DD to DD.MM.YYYY
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

function formatMessageDates(message: string): string {
  // Convert ISO dates (YYYY-MM-DD) in the message to German format (DD.MM.YYYY)
  // Handle date ranges like "2025-08-11 to 2025-08-15"
  const isoRangeRegex = /(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/g
  const isoSingleRegex = /(\d{4}-\d{2}-\d{2})/g
  
  let formattedMessage = message
  
  // Replace date ranges first
  formattedMessage = formattedMessage.replace(isoRangeRegex, (match, startDate, endDate) => {
    return `${convertISOToGerman(startDate)} - ${convertISOToGerman(endDate)}`
  })
  
  // Replace remaining single dates
  formattedMessage = formattedMessage.replace(isoSingleRegex, (match, date) => {
    return convertISOToGerman(date)
  })
  
  return formattedMessage
}
</script>