<template>
  <div class="bg-white rounded-xl shadow-lg">
    <!-- Calendar Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Holiday Calendar</h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ remainingHolidayDays }} of {{ totalHolidayDays }} days remaining
          </p>
        </div>
        <button
          @click="showRequestModal = true"
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Request Holiday
        </button>
      </div>
    </div>

    <!-- Calendar Navigation -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <button
          @click="previousMonth"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 class="text-lg font-medium text-gray-900">
          {{ currentMonthName }} {{ currentYear }}
        </h3>
        
        <button
          @click="nextMonth"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="p-6">
      <!-- Day Headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in dayHeaders"
          :key="day"
          class="p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in calendarDays"
          :key="`${day.date.getTime()}`"
          :class="[
            'relative p-2 h-12 text-sm border border-gray-100 transition-colors',
            day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300',
            day.isToday ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50',
            day.isWeekend ? 'bg-gray-50' : '',
            day.hasHoliday ? getHolidayClasses(day.holidayStatus!) : ''
          ]"
        >
          <span class="font-medium">{{ day.date.getDate() }}</span>
          
          <!-- Holiday Status Indicator -->
          <div
            v-if="day.hasHoliday"
            :class="[
              'absolute bottom-1 left-1 right-1 h-1 rounded-full',
              day.holidayStatus === 'approved' ? 'bg-green-500' : 
              day.holidayStatus === 'denied' ? 'bg-red-400' : 'bg-blue-500'
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- Calendar Legend -->
    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center justify-center space-x-6 text-sm">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span class="text-gray-600">Approved Holiday</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span class="text-gray-600">Pending Request</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span class="text-gray-600">Denied Request</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-primary-200 rounded-full mr-2"></div>
          <span class="text-gray-600">Today</span>
        </div>
      </div>
    </div>

    <!-- Holiday Request Modal -->
    <HolidayRequestModal
      v-if="showRequestModal"
      @close="showRequestModal = false"
      @success="handleRequestSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { useAuth } from '@/composables/useAuth'
import { useHolidayRequests } from '@/composables/useHolidayRequests'
import HolidayRequestModal from './HolidayRequestModal.vue'
import type { CalendarDay } from '@/types'

// Composables
const { user } = useAuth()
const { 
  remainingHolidayDays, 
  fetchHolidayRequests,
  getHolidayStatusForDate 
} = useHolidayRequests()

// State
const currentDate = ref(new Date())
const showRequestModal = ref(false)

// Computed
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long' })
})

const totalHolidayDays = computed(() => user.value?.holiday_allowance || 25)

const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const calendarDays = computed((): CalendarDay[] => {
  const year = currentYear.value
  const month = currentMonth.value
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // First day of the month
  const firstDay = new Date(year, month, 1)
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  
  // Start from Monday of the week containing the first day
  const startDate = new Date(firstDay)
  const dayOfWeek = firstDay.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday = 0
  startDate.setDate(firstDay.getDate() - daysToSubtract)

  // End on Sunday of the week containing the last day
  const endDate = new Date(lastDay)
  const lastDayOfWeek = lastDay.getDay()
  const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
  endDate.setDate(lastDay.getDate() + daysToAdd)

  const days: CalendarDay[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    // Use date-fns format to avoid timezone issues
    const dateString = format(current, 'yyyy-MM-dd')
    const holidayStatus = getHolidayStatusForDate(dateString)
    
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.getTime() === today.getTime(),
      hasHoliday: holidayStatus !== null,
      holidayStatus: holidayStatus || undefined,
      isWeekend: current.getDay() === 0 || current.getDay() === 6
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

// Methods
function previousMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

function getHolidayClasses(status: 'approved' | 'pending' | 'denied'): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 border-green-300 text-green-900'
    case 'denied':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'pending':
    default:
      return 'bg-blue-100 border-blue-300 text-blue-900'
  }
}

async function handleRequestSuccess() {
  showRequestModal.value = false
  // No need to refresh - the store will automatically update all components
}

// Lifecycle
onMounted(async () => {
  await fetchHolidayRequests(currentYear.value)
})
</script>