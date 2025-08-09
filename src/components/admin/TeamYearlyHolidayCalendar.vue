<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
    <!-- Calendar Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Team Holiday Calendar {{ currentYear }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Overview of all approved team holidays
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

    <!-- Loading State -->
    <div v-if="loading" class="p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="i in 12" :key="i" class="animate-pulse">
          <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
        </div>
      </div>
    </div>

    <!-- Yearly Calendar Grid -->
    <div v-else class="p-6">
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
                  day.hasHolidays ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100' : '',
                  'hover:bg-gray-100 dark:hover:bg-gray-600 rounded'
                ]"
                :title="getDateTitle(day)"
              >
                <span class="relative z-10">{{ day.date.getDate() }}</span>
                
                <!-- Holiday Count Indicator -->
                <div
                  v-if="day.hasHolidays && day.holidayCount > 0"
                  class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 dark:bg-green-400 text-white rounded-full flex items-center justify-center text-xs font-bold"
                  style="font-size: 8px; line-height: 1;"
                >
                  {{ day.holidayCount > 9 ? '9+' : day.holidayCount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Legend -->
    <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
      <div class="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-2"></div>
          <span class="text-gray-600 dark:text-gray-300">Team Holidays</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-primary-200 dark:bg-primary-400 rounded-full mr-2"></div>
          <span class="text-gray-600 dark:text-gray-300">Today</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-1 text-white text-xs flex items-center justify-center font-bold" style="font-size: 8px;">3</div>
          <span class="text-gray-600 dark:text-gray-300 ml-1">Number of team members on holiday</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import { supabase } from '@/utils/supabase'
import type { HolidayRequest, CalendarDay } from '@/types'

// State
const currentYear = ref(new Date().getFullYear())
const loading = ref(false)
const teamHolidayRequests = ref<(HolidayRequest & { user_name: string })[]>([])

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
function getMonthDays(year: number, month: number): (CalendarDay & { hasHolidays: boolean; holidayCount: number })[] {
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

  const days: (CalendarDay & { hasHolidays: boolean; holidayCount: number })[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateString = format(current, 'yyyy-MM-dd')
    const holidaysOnDate = getHolidaysForDate(dateString)
    
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.getTime() === today.getTime(),
      hasHoliday: false, // Not used for team calendar
      holidayStatus: undefined, // Not used for team calendar
      isWeekend: current.getDay() === 0 || current.getDay() === 6,
      hasHolidays: holidaysOnDate.length > 0,
      holidayCount: holidaysOnDate.length
    })

    current.setDate(current.getDate() + 1)
  }

  return days
}

function getHolidaysForDate(dateString: string): (HolidayRequest & { user_name: string })[] {
  return teamHolidayRequests.value.filter(request => 
    request.status === 'approved' &&
    dateString >= request.start_date && 
    dateString <= request.end_date
  )
}

function getDateTitle(day: CalendarDay & { hasHolidays: boolean; holidayCount: number }): string {
  if (!day.hasHolidays) return ''
  
  const dateString = format(day.date, 'yyyy-MM-dd')
  const holidaysOnDate = getHolidaysForDate(dateString)
  
  if (holidaysOnDate.length === 0) return ''
  
  const names = holidaysOnDate.map(h => h.user_name).join(', ')
  const dateFormatted = format(day.date, 'MMM d, yyyy')
  
  return `${dateFormatted}: ${names} on holiday`
}

function previousYear() {
  currentYear.value--
}

function nextYear() {
  currentYear.value++
}

async function fetchTeamHolidays() {
  loading.value = true
  
  try {
    const yearStart = `${currentYear.value}-01-01`
    const yearEnd = `${currentYear.value}-12-31`

    const { data, error } = await supabase
      .from('holiday_requests')
      .select(`
        *,
        users!inner(full_name)
      `)
      .eq('status', 'approved')
      .gte('start_date', yearStart)
      .lte('start_date', yearEnd)
      .order('start_date', { ascending: true })

    if (error) throw error

    // Transform the data to include user_name
    teamHolidayRequests.value = (data || []).map(request => ({
      ...request,
      user_name: (request.users as any).full_name
    }))

  } catch (err) {
    console.error('Error fetching team holidays:', err)
    teamHolidayRequests.value = []
  } finally {
    loading.value = false
  }
}

// Watch for year changes
watch(currentYear, () => {
  fetchTeamHolidays()
})

// Lifecycle
onMounted(() => {
  fetchTeamHolidays()
})
</script>