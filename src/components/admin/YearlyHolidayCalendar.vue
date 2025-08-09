<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
    <!-- Calendar Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Holiday Calendar {{ currentYear }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ user?.full_name }}'s holiday requests overview
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="previousYear"
            class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[4rem] text-center">
            {{ currentYear }}
          </span>
          <button
            @click="nextYear"
            class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Yearly Calendar Grid -->
    <div class="p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="month in months"
          :key="month.monthIndex"
          class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <!-- Month Header -->
          <div class="bg-gray-50 dark:bg-gray-700 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
              {{ month.name }}
            </h4>
          </div>

          <!-- Mini Calendar -->
          <div class="p-2">
            <!-- Day Headers -->
            <div class="grid grid-cols-7 gap-px mb-1">
              <div
                v-for="day in dayHeaders"
                :key="day"
                class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
              >
                {{ day }}
              </div>
            </div>

            <!-- Calendar Days -->
            <div class="grid grid-cols-7 gap-px">
              <div
                v-for="day in month.days"
                :key="`${month.monthIndex}-${day.date.getTime()}`"
                :class="[
                  'relative text-xs h-7 flex items-center justify-center transition-colors cursor-pointer',
                  day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-600',
                  day.isToday ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100 font-semibold rounded' : '',
                  day.isWeekend && day.isCurrentMonth ? 'text-gray-500 dark:text-gray-400' : '',
                  day.hasHoliday ? getHolidayClasses(day.holidayStatus!) : '',
                  'hover:bg-gray-100 dark:hover:bg-gray-600 rounded'
                ]"
                :title="getDateTitle(day)"
              >
                <span class="relative z-10">{{ day.date.getDate() }}</span>
                
                <!-- Holiday Status Indicator -->
                <div
                  v-if="day.hasHoliday"
                  :class="[
                    'absolute inset-0 rounded',
                    day.holidayStatus === 'approved' ? 'bg-green-200 dark:bg-green-800/50' : 
                    day.holidayStatus === 'denied' ? 'bg-red-200 dark:bg-red-800/50' : 'bg-blue-200 dark:bg-blue-800/50'
                  ]"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Legend -->
    <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
      <div class="flex items-center justify-center space-x-6 text-sm">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-2"></div>
          <span class="text-gray-600 dark:text-gray-300">Approved Holiday</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></div>
          <span class="text-gray-600 dark:text-gray-300">Pending Request</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full mr-2"></div>
          <span class="text-gray-600 dark:text-gray-300">Denied Request</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-primary-200 dark:bg-primary-400 rounded-full mr-2"></div>
          <span class="text-gray-600 dark:text-gray-300">Today</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import type { User, HolidayRequest, CalendarDay } from '@/types'

// Props
interface Props {
  user: User
  holidayRequests: HolidayRequest[]
}

const props = defineProps<Props>()

// State
const currentYear = ref(new Date().getFullYear())

// Computed
const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const months = computed(() => {
  const monthsData = []
  
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const monthName = new Date(currentYear.value, monthIndex, 1).toLocaleDateString('en-US', { month: 'long' })
    const days = getMonthDays(currentYear.value, monthIndex)
    
    monthsData.push({
      monthIndex,
      name: monthName,
      days
    })
  }
  
  return monthsData
})

// Methods
function getMonthDays(year: number, month: number): CalendarDay[] {
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
}

function getHolidayStatusForDate(dateString: string): 'approved' | 'pending' | 'denied' | null {
  for (const request of props.holidayRequests) {
    if (dateString >= request.start_date && dateString <= request.end_date) {
      return request.status
    }
  }
  return null
}

function getHolidayClasses(status: 'approved' | 'pending' | 'denied'): string {
  switch (status) {
    case 'approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
    case 'denied':
      return 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-100'
    case 'pending':
    default:
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
  }
}

function getDateTitle(day: CalendarDay): string {
  if (!day.hasHoliday) return ''
  
  const request = props.holidayRequests.find(req => {
    const dateString = format(day.date, 'yyyy-MM-dd')
    return dateString >= req.start_date && dateString <= req.end_date
  })
  
  if (!request) return ''
  
  const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1)
  const dateRange = request.start_date === request.end_date 
    ? format(new Date(request.start_date), 'MMM d')
    : `${format(new Date(request.start_date), 'MMM d')} - ${format(new Date(request.end_date), 'MMM d')}`
  
  return `${statusText} Holiday: ${dateRange}${request.reason ? ` - ${request.reason}` : ''}`
}

function previousYear() {
  currentYear.value--
}

function nextYear() {
  currentYear.value++
}

// Watch for year changes to potentially fetch new data
watch(currentYear, (newYear) => {
  // Emit event if parent needs to fetch data for new year
  // For now, we'll work with the provided holiday requests
})

// Lifecycle
onMounted(() => {
  // Set current year based on user's holiday requests if available
  if (props.holidayRequests.length > 0) {
    const latestRequest = props.holidayRequests
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    const requestYear = new Date(latestRequest.start_date).getFullYear()
    currentYear.value = requestYear
  }
})
</script>