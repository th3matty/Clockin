<template>
  <div class="space-y-6">
    <!-- Quick Stats -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">Holiday Summary</h3>
        <button
          @click="refreshData"
          :disabled="loading"
          class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
        >
          <svg 
            :class="['w-3 h-3 mr-1', loading ? 'animate-spin' : '']" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Total Allowance</span>
          <span class="font-semibold text-gray-900">{{ totalHolidayDays }} days</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Used This Year</span>
          <span class="font-semibold text-gray-900">{{ usedHolidayDays }} days</span>
        </div>
        <div class="flex items-center justify-between border-t pt-4">
          <span class="text-sm font-medium text-gray-900">Remaining</span>
          <span class="font-bold text-primary-600">{{ remainingHolidayDays }} days</span>
        </div>
        
        <!-- Debug Info (temporary) -->
        <div class="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <div>Total requests: {{ holidayRequests?.length || 0 }}</div>
          <div>Approved requests: {{ approvedRequestsCount }}</div>
          <div>Current year: {{ currentYear }}</div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${usagePercentage}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ usagePercentage.toFixed(0) }}% used</p>
        </div>
      </div>
    </div>

    <!-- Holiday Requests -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Recent Requests</h3>
      </div>
      
      <div class="px-6 py-4">
        <div v-if="loading" class="text-center py-8">
          <svg class="animate-spin h-6 w-6 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-500 mt-2 text-sm">Loading requests...</p>
        </div>

        <div v-else-if="recentRequests.length === 0" class="text-center py-8">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500">No holiday requests yet</p>
          <p class="text-sm text-gray-400 mt-1">Click "Request Holiday" to get started</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="request in recentRequests"
            :key="request.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <!-- Request Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStatusClasses(request.status)
                  ]"
                >
                  {{ getStatusText(request.status) }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ request.days_requested }} {{ request.days_requested === 1 ? 'day' : 'days' }}
                </span>
              </div>
              
              <!-- Cancel Button for Pending Requests -->
              <button
                v-if="request.status === 'pending'"
                @click="handleCancelRequest(request.id)"
                :disabled="cancelLoading"
                class="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            <!-- Request Dates -->
            <div class="text-sm text-gray-900 mb-2">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDateRange(request.start_date, request.end_date) }}
              </div>
            </div>

            <!-- Request Reason -->
            <div v-if="request.reason" class="text-sm text-gray-600 mb-2">
              <div class="flex items-start">
                <svg class="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span class="italic">{{ request.reason }}</span>
              </div>
            </div>

            <!-- Admin Notes for Denied Requests -->
            <div v-if="request.status === 'denied' && request.admin_notes" class="text-sm text-red-600 bg-red-50 rounded p-2 mt-2">
              <div class="flex items-start">
                <svg class="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
import { useAuth } from '@/composables/useAuth'
import { useHolidayRequests } from '@/composables/useHolidayRequests'
import type { HolidayRequest } from '@/types'

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

// Computed
const totalHolidayDays = computed(() => user.value?.holiday_allowance || 25)

const usagePercentage = computed(() => {
  if (totalHolidayDays.value === 0) return 0
  const used = usedHolidayDays.value
  console.log('🔍 HolidayRequestsList: usagePercentage calculation:', {
    used,
    total: totalHolidayDays.value,
    percentage: (used / totalHolidayDays.value) * 100
  })
  return (used / totalHolidayDays.value) * 100
})

const recentRequests = computed(() => {
  const requests = holidayRequests.value || []
  console.log('🔄 recentRequests computed - holidayRequests length:', requests.length)
  return requests.slice(0, 10) // Show last 10 requests
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

// Methods
function getStatusClasses(status: string): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'denied':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
  // Parse dates as local dates to avoid timezone shifts
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed
  }
  
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)
  
  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  
  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  
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
    console.log('🗑️ Canceling request:', requestId)
    console.log('📊 Before cancel - Total requests:', holidayRequests.value?.length)
    
    const result = await cancelHolidayRequest(requestId)
    
    if (result.success) {
      console.log('✅ Cancel successful')
      console.log('📊 After cancel - Total requests:', holidayRequests.value?.length)
      // Request will be removed from the list automatically by the store
    } else {
      console.log('❌ Cancel failed:', result.error)
    }
  } catch (err) {
    console.error('Cancel request error:', err)
  } finally {
    cancelLoading.value = false
  }
}

// Methods for refreshing data
async function refreshData() {
  console.log('🔄 Refreshing holiday requests data...')
  const result = await fetchHolidayRequests()
  console.log('📥 Fetch result:', result)
  console.log('📊 Holiday requests after fetch:', holidayRequests.value)
}

// Lifecycle
onMounted(async () => {
  // Always fetch fresh data when component mounts
  await fetchHolidayRequests()
})
</script>