<template>
  <div class="space-y-6">
    <!-- Quick Stats -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Holiday Summary</h3>
        <button @click="handleRefreshClick" :disabled="loading"
          class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
          <Vue3Lottie :animationData="refreshAnimation" :height="16" :width="16" :loop="false" :autoPlay="false"
            ref="refreshLottieRef" class="mr-2" />
          Refresh
        </button>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Total Allowance</span>
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ totalHolidayDays }} days</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Used This Year</span>
            <div class="relative group">
              <Vue3Lottie :animationData="helpAnimation" :height="16" :width="16" :loop="true" :autoPlay="false"
                ref="helpLottieRef" class="cursor-help opacity-60 hover:opacity-100 transition-opacity"
                @mouseenter="playHelpAnimation" />

              <!-- Tooltip -->
              <div
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                <div class="space-y-1">
                  <div class="font-medium mb-2">Approved Holidays This Year:</div>
                  <div v-if="approvedHolidaysThisYear.length === 0" class="text-gray-300">
                    No approved holidays yet
                  </div>
                  <div v-else class="space-y-1">
                    <div v-for="holiday in approvedHolidaysThisYear" :key="holiday.id"
                      class="flex justify-between gap-4">
                      <span>{{ formatDateRange(holiday.start_date, holiday.end_date) }}</span>
                      <span class="text-gray-300">{{ holiday.days_requested }} {{ holiday.days_requested === 1 ? 'day' :
                        'days' }}</span>
                    </div>
                  </div>
                </div>
                <!-- Tooltip arrow -->
                <div
                  class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700">
                </div>
              </div>
            </div>
          </div>
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ usedHolidayDays }} days</span>
        </div>
        <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Remaining</span>
          <span class="font-bold text-primary-600 dark:text-primary-400">{{ remainingHolidayDays }} days</span>
        </div>

        <!-- Debug Info (temporary) -->
        <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
          <div>Total requests: {{ holidayRequests?.length || 0 }}</div>
          <div>Approved requests: {{ approvedRequestsCount }}</div>
          <div>Current year: {{ currentYear }}</div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${usagePercentage}%` }"></div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ usagePercentage.toFixed(0) }}% used</p>
        </div>
      </div>
    </div>

    <!-- Holiday Requests -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Requests</h3>
      </div>

      <div class="px-6 py-4 max-h-96 overflow-y-auto custom-scrollbar">
        <div v-if="loading" class="text-center py-8">
          <svg class="animate-spin h-6 w-6 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">Loading requests...</p>
        </div>

        <div v-else-if="recentRequests.length === 0" class="text-center py-8">
          <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">No holiday requests yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Request Holiday" to get started</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="request in recentRequests" :key="request.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <!-- Request Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatusClasses(request.status)
                ]">
                  {{ getStatusText(request.status) }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ request.days_requested }} {{ request.days_requested === 1 ? 'day' : 'days' }}
                </span>
              </div>

              <!-- Cancel Button for Pending Requests -->
              <button v-if="request.status === 'pending'" @click="handleCancelRequest(request.id)"
                :disabled="cancelLoading"
                class="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium disabled:opacity-50 transition-colors">
                Cancel
              </button>
            </div>

            <!-- Request Dates -->
            <div class="text-sm text-gray-900 dark:text-gray-100 mb-2">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDateRange(request.start_date, request.end_date) }}
              </div>
            </div>

            <!-- Request Reason -->
            <div v-if="request.reason" class="text-sm text-gray-600 mb-2">
              <div class="flex items-start">
                <svg class="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span class="italic">{{ request.reason }}</span>
              </div>
            </div>

            <!-- Admin Notes for Denied Requests -->
            <div v-if="request.status === 'denied' && request.admin_notes"
              class="text-sm text-red-600 dark:text-red-200 bg-red-50 dark:bg-red-900/20 rounded p-2 mt-2">
              <div class="flex items-start">
                <svg class="w-4 h-4 text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p class="font-medium">Admin Notes:</p>
                  <p>{{ request.admin_notes }}</p>
                </div>
              </div>
            </div>

            <!-- Request Date -->
            <div class="text-xs text-gray-400 mt-3">
              Requested {{ formatRequestDate(request.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format, parseISO } from 'date-fns'
import { useAuth } from '@/composables/useAuth'
import { useHolidayRequests } from '@/composables/useHolidayRequests'
import type { HolidayRequest } from '@/types'
import { Vue3Lottie } from 'vue3-lottie'
import helpAnimationData from '@/assets/help.json'
import refreshAnimationData from '@/assets/refresh.json'

// Composables
const { user } = useAuth()
const {
  loading,
  holidayRequests,
  remainingHolidayDays,
  usedHolidayDays,
  fetchHolidayRequests,
  cancelHolidayRequest
} = useHolidayRequests()

// State
const cancelLoading = ref(false)
const helpLottieRef = ref()
const refreshLottieRef = ref()
const helpAnimation = helpAnimationData
const refreshAnimation = refreshAnimationData

// Computed
const totalHolidayDays = computed(() => user.value?.holiday_allowance || 25)

const usagePercentage = computed(() => {
  if (totalHolidayDays.value === 0) return 0
  const used = usedHolidayDays.value
  return (used / totalHolidayDays.value) * 100
})

const recentRequests = computed(() => {
  const requests = holidayRequests.value || []
  return requests.slice(0, 5) // Show last 5 requests
})

// Debug computed properties
const currentYear = computed(() => new Date().getFullYear())
const approvedRequestsCount = computed(() => {
  const requests = holidayRequests.value || []
  const approved = requests.filter((request: HolidayRequest) =>
    request.status === 'approved' &&
    new Date(request.start_date).getFullYear() === currentYear.value
  )
  return approved.length
})

// Approved holidays for tooltip
const approvedHolidaysThisYear = computed(() => {
  const requests = holidayRequests.value || []
  return requests
    .filter((request: HolidayRequest) =>
      request.status === 'approved' &&
      new Date(request.start_date).getFullYear() === currentYear.value
    )
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
})

// Methods
function getStatusClasses(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    case 'denied':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    case 'pending':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'denied':
      return 'Denied'
    case 'pending':
      return 'Pending'
    default:
      return 'Unknown'
  }
}

function formatDateRange(startDate: string, endDate: string): string {
  // Use date-fns to parse and format dates properly
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  const startFormatted = format(start, 'MMM d')
  const endFormatted = format(end, 'MMM d')

  if (startDate === endDate) {
    return startFormatted
  }

  return `${startFormatted} - ${endFormatted}`
}

function formatRequestDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'today'
  } else if (diffInDays === 1) {
    return 'yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

async function handleCancelRequest(requestId: string) {
  if (!confirm('Are you sure you want to cancel this holiday request?')) return

  try {
    cancelLoading.value = true

    const result = await cancelHolidayRequest(requestId)

    if (result.success) {
      // Request will be removed from the list automatically by the store
    }
  } catch (err) {
    // Handle error silently
  } finally {
    cancelLoading.value = false
  }
}

// Methods for refreshing data
async function refreshData() {
  const result = await fetchHolidayRequests()
}

async function handleRefreshClick() {
  // Play the refresh animation once
  if (refreshLottieRef.value) {
    refreshLottieRef.value.play()
  }
  
  // Execute the refresh
  await refreshData()
}

// Animation methods
function playHelpAnimation() {
  if (helpLottieRef.value) {
    helpLottieRef.value.play()
  }
}

// Lifecycle
onMounted(async () => {
  // Always fetch fresh data when component mounts
  await fetchHolidayRequests()
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