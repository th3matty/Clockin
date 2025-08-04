<template>
  <div class="space-y-6">
    <!-- Weekly Hours Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <h3 class="text-sm font-medium text-gray-900">This Week</h3>
          <div class="flex items-baseline">
            <p class="text-2xl font-semibold text-gray-900">{{ weeklyHours.toFixed(1) }}h</p>
            <p class="ml-2 text-sm text-gray-500">/ {{ expectedWeeklyHours }}h</p>
          </div>
          <div class="mt-2">
            <div class="bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(weeklyProgress, 100)}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ weeklyProgress.toFixed(0) }}% of expected hours</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Hours Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <h3 class="text-sm font-medium text-gray-900">This Month</h3>
          <div class="flex items-baseline">
            <p class="text-2xl font-semibold text-gray-900">{{ monthlyHours.toFixed(1) }}h</p>
            <p class="ml-2 text-sm text-gray-500">/ {{ expectedMonthlyHours }}h</p>
          </div>
          <div class="mt-2">
            <div class="bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(monthlyProgress, 100)}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ monthlyProgress.toFixed(0) }}% of expected hours</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Holiday Days Left Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <h3 class="text-sm font-medium text-gray-900">Holiday Days Left</h3>
          <div class="flex items-baseline">
            <p class="text-2xl font-semibold text-gray-900">{{ remainingHolidays }}</p>
            <p class="ml-2 text-sm text-gray-500">/ {{ totalHolidays }} days</p>
          </div>
          <div class="mt-2">
            <div class="bg-gray-200 rounded-full h-2">
              <div 
                class="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${holidayProgress}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ holidayProgress.toFixed(0) }}% remaining</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Status Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <h3 class="text-sm font-medium text-gray-900">Today's Hours</h3>
          <div class="flex items-baseline">
            <p class="text-2xl font-semibold text-gray-900">
              {{ todayEntry ? todayEntry.total_hours.toFixed(1) : '0.0' }}h
            </p>
            <p class="ml-2 text-sm text-gray-500">/ {{ expectedDailyHours }}h</p>
          </div>
          <div class="mt-2">
            <div 
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                todayStatus.color
              ]"
            >
              {{ todayStatus.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div class="space-y-3">
        <router-link
          to="/employee/calendar"
          class="flex items-center p-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Holiday Calendar
        </router-link>
        
        <router-link
          to="/employee/history"
          class="flex items-center p-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Time History
        </router-link>
        
        <button
          @click="$emit('requestHoliday')"
          class="flex items-center w-full p-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Request Holiday
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTimeEntries } from '@/composables/useTimeEntries'
import { useHolidayRequests } from '@/composables/useHolidayRequests'

// Emits
defineEmits<{
  requestHoliday: []
}>()

// Composables
const { user } = useAuth()
const { weeklyHours, monthlyHours, todayEntry } = useTimeEntries()
const { remainingHolidayDays, usedHolidayDays, fetchHolidayRequests } = useHolidayRequests()

// Computed
const expectedDailyHours = computed(() => {
  if (!user.value) return 8
  
  // Calculate based on user's default settings
  const startTime = user.value.default_start_time || '09:00:00'
  const endTime = user.value.default_end_time || '17:00:00'
  const lunchMinutes = user.value.default_lunch_minutes || 60
  
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
  const workingMinutes = totalMinutes - lunchMinutes
  
  return Math.max(0, workingMinutes / 60)
})

const expectedWeeklyHours = computed(() => expectedDailyHours.value * 5) // 5 working days

const expectedMonthlyHours = computed(() => {
  // Approximate 22 working days per month
  return expectedDailyHours.value * 22
})

const weeklyProgress = computed(() => {
  if (expectedWeeklyHours.value === 0) return 0
  return (weeklyHours.value / expectedWeeklyHours.value) * 100
})

const monthlyProgress = computed(() => {
  if (expectedMonthlyHours.value === 0) return 0
  return (monthlyHours.value / expectedMonthlyHours.value) * 100
})

const totalHolidays = computed(() => user.value?.holiday_allowance || 25)

const remainingHolidays = computed(() => {
  const remaining = remainingHolidayDays.value
  const used = usedHolidayDays.value
  console.log('🔍 QuickStats: remainingHolidayDays:', remaining)
  console.log('🔍 QuickStats: usedHolidayDays:', used)
  return remaining ?? totalHolidays.value
})

const holidayProgress = computed(() => {
  if (totalHolidays.value === 0) return 0
  const remaining = remainingHolidays.value ?? 0
  const progress = (remaining / totalHolidays.value) * 100
  console.log('🔍 QuickStats: holidayProgress calculation:', { remaining, total: totalHolidays.value, progress })
  return progress
})

const todayStatus = computed(() => {
  const todayHours = todayEntry.value?.total_hours || 0
  const expected = expectedDailyHours.value
  
  if (todayHours === 0) {
    return {
      text: 'No entry yet',
      color: 'bg-gray-100 text-gray-800'
    }
  } else if (todayHours >= expected) {
    return {
      text: 'Complete',
      color: 'bg-green-100 text-green-800'
    }
  } else if (todayHours >= expected * 0.8) {
    return {
      text: 'Almost there',
      color: 'bg-yellow-100 text-yellow-800'
    }
  } else {
    return {
      text: 'In progress',
      color: 'bg-blue-100 text-blue-800'
    }
  }
})

// Lifecycle
onMounted(async () => {
  await fetchHolidayRequests()
})
</script>