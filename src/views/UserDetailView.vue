<template>
  <ProtectedRoute :require-auth="true" require-role="admin">
    <Layout>
      <div class="max-w-7xl mx-auto py-6 px-4">
        <!-- Back Navigation -->
        <div class="mb-6">
          <button 
            @click="$router.push('/admin')"
            class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Team Overview
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 class="text-lg font-medium text-red-800 dark:text-red-200">Error Loading User Details</h3>
              <p class="text-red-600 dark:text-red-300 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- User Detail Content -->
        <div v-else-if="user" class="space-y-6">
          <!-- User Header -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-6">
                <!-- Avatar -->
                <div class="relative">
                  <SecureAvatar 
                    :avatar-path="user.avatar_url"
                    :name="user.full_name"
                    size="xl"
                    :alt="user.full_name"
                    class="border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                  <div 
                    :class="[
                      'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-gray-700',
                      getUserStatusColor(user)
                    ]"
                  ></div>
                </div>

                <!-- User Info -->
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ user.full_name }}</h1>
                  <p class="text-lg text-gray-600 dark:text-gray-400 capitalize">{{ user.role }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">{{ user.email }}</p>
                  <div class="flex items-center mt-2">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getUserStatusClasses(user)
                      ]"
                    >
                      {{ getUserStatusText(user) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex space-x-3">
                <button 
                  @click="showHolidayManagement = true"
                  class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Manage Holiday Allowance
                </button>
                <button 
                  @click="exportUserData"
                  class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </button>
              </div>
            </div>
          </div>

          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Today's Hours -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Hours</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ todayHours.toFixed(1) }}h</p>
                </div>
              </div>
            </div>

            <!-- This Week -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ weeklyHours.toFixed(1) }}h</p>
                </div>
              </div>
            </div>

            <!-- Holiday Days Left -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Holiday Days Left</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ remainingHolidays }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Time Tracking Details (2/3 width) -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Recent Time Entries -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Time Entries</h3>
                </div>
                <div class="p-6">
                  <div v-if="recentTimeEntries.length === 0" class="text-center py-8">
                    <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400">No time entries found</p>
                  </div>
                  <div v-else class="space-y-4">
                    <div 
                      v-for="entry in recentTimeEntries" 
                      :key="entry.id"
                      class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                          <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatDate(entry.date) }}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ entry.start_time.slice(0, 5) }} - {{ entry.end_time.slice(0, 5) }}
                            <span v-if="entry.lunch_break_minutes > 0">
                              ({{ entry.lunch_break_minutes }}min lunch)
                            </span>
                          </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ (entry.total_hours + (entry.overtime_hours || 0)).toFixed(1) }}h</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          <span v-if="entry.overtime_hours && entry.overtime_hours > 0">
                            {{ entry.total_hours.toFixed(1) }}h + {{ entry.overtime_hours.toFixed(1) }}h OT
                          </span>
                          <span v-else>Total hours</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Working Patterns Chart -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Working Patterns (Last 30 Days)</h3>
                </div>
                <div class="p-6">
                  <div class="space-y-4">
                    <div v-for="(hours, day) in weeklyPattern" :key="day" class="flex items-center">
                      <div class="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">{{ day }}</div>
                      <div class="flex-1 mx-4">
                        <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            :style="{ width: `${(hours / 10) * 100}%` }"
                          ></div>
                        </div>
                      </div>
                      <div class="w-12 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{{ hours.toFixed(1) }}h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar (1/3 width) -->
            <div class="space-y-6">
              <!-- Holiday Summary -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Holiday Summary</h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Total Allowance</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">{{ user.holiday_allowance || 25 }} days</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Used This Year</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">{{ usedHolidays }} days</span>
                  </div>
                  <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Remaining</span>
                    <span class="font-bold text-primary-600 dark:text-primary-400">{{ remainingHolidays }} days</span>
                  </div>
                  <div class="mt-4">
                    <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${holidayUsagePercentage}%` }"
                      ></div>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ holidayUsagePercentage.toFixed(0) }}% used</p>
                  </div>
                </div>
              </div>

              <!-- Recent Holiday Requests -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Holiday Requests</h3>
                </div>
                <div class="p-6">
                  <div v-if="recentHolidayRequests.length === 0" class="text-center py-4">
                    <p class="text-sm text-gray-500 dark:text-gray-400">No recent requests</p>
                  </div>
                  <div v-else class="space-y-3">
                    <div 
                      v-for="request in recentHolidayRequests" 
                      :key="request.id"
                      class="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <span 
                          :class="[
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            getHolidayStatusClasses(request.status)
                          ]"
                        >
                          {{ getHolidayStatusText(request.status) }}
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ request.days_requested }} {{ request.days_requested === 1 ? 'day' : 'days' }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-900 dark:text-gray-100">
                        {{ formatDateRange(request.start_date, request.end_date) }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ formatRequestDate(request.created_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Quick Stats</h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Avg. Daily Hours</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">{{ averageDailyHours.toFixed(1) }}h</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Total This Month</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">{{ monthlyHours.toFixed(1) }}h</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Days Worked</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">{{ daysWorked }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Holiday Management Modal -->
        <HolidayManagementModal
          v-if="showHolidayManagement && user"
          :user="user"
          @close="showHolidayManagement = false"
          @updated="refreshUserData"
        />
      </div>
    </Layout>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import ProtectedRoute from '@/components/auth/ProtectedRoute.vue'
import Layout from '@/components/shared/Layout.vue'
import HolidayManagementModal from '@/components/admin/HolidayManagementModal.vue'
import SecureAvatar from '@/components/shared/SecureAvatar.vue'
import { useUserDetail } from '@/composables/useUserDetail'
import type { User, TimeEntry, HolidayRequest } from '@/types'

// Route
const route = useRoute()
const userId = route.params.id as string

// Composables
const {
  user,
  timeEntries,
  holidayRequests,
  loading,
  error,
  fetchUserDetail,
  exportUserData: exportData
} = useUserDetail()

// State
const showHolidayManagement = ref(false)

// Computed properties
const todayHours = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = timeEntries.value.find(entry => entry.date === today)
  return todayEntry ? (todayEntry.total_hours + (todayEntry.overtime_hours || 0)) : 0
})

const weeklyHours = computed(() => {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  
  return timeEntries.value
    .filter(entry => {
      const entryDate = parseISO(entry.date)
      return entryDate >= weekStart && entryDate <= weekEnd
    })
    .reduce((total, entry) => total + entry.total_hours + (entry.overtime_hours || 0), 0)
})

const monthlyHours = computed(() => {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  
  return timeEntries.value
    .filter(entry => {
      const entryDate = parseISO(entry.date)
      return entryDate >= monthStart && entryDate <= monthEnd
    })
    .reduce((total, entry) => total + entry.total_hours + (entry.overtime_hours || 0), 0)
})

const usedHolidays = computed(() => {
  const currentYear = new Date().getFullYear()
  return holidayRequests.value
    .filter(request => 
      request.status === 'approved' && 
      new Date(request.start_date).getFullYear() === currentYear
    )
    .reduce((total, request) => total + request.days_requested, 0)
})

const remainingHolidays = computed(() => {
  const totalAllowance = user.value?.holiday_allowance || 25
  return Math.max(0, totalAllowance - usedHolidays.value)
})

const holidayUsagePercentage = computed(() => {
  const totalAllowance = user.value?.holiday_allowance || 25
  return (usedHolidays.value / totalAllowance) * 100
})



const recentTimeEntries = computed(() => {
  return timeEntries.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
})

const recentHolidayRequests = computed(() => {
  return holidayRequests.value
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
})

const averageDailyHours = computed(() => {
  if (timeEntries.value.length === 0) return 0
  const totalHours = timeEntries.value.reduce((sum, entry) => sum + entry.total_hours + (entry.overtime_hours || 0), 0)
  return totalHours / timeEntries.value.length
})

const daysWorked = computed(() => {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  
  return timeEntries.value.filter(entry => {
    const entryDate = parseISO(entry.date)
    return entryDate >= monthStart && entryDate <= monthEnd
  }).length
})

const weeklyPattern = computed(() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const pattern: Record<string, number> = {}
  
  days.forEach(day => {
    pattern[day] = 0
  })
  
  // Calculate average hours per day of week from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentEntries = timeEntries.value.filter(entry => 
    parseISO(entry.date) >= thirtyDaysAgo
  )
  
  const dayCount: Record<string, number> = {}
  days.forEach(day => { dayCount[day] = 0 })
  
  recentEntries.forEach(entry => {
    const dayOfWeek = format(parseISO(entry.date), 'EEE')
    const dayKey = days.find(d => d === dayOfWeek)
    if (dayKey) {
      pattern[dayKey] += entry.total_hours + (entry.overtime_hours || 0)
      dayCount[dayKey]++
    }
  })
  
  // Calculate averages
  days.forEach(day => {
    if (dayCount[day] > 0) {
      pattern[day] = pattern[day] / dayCount[day]
    }
  })
  
  return pattern
})

// Methods
function getUserStatusColor(user: User): string {
  // Check if user is currently on holiday
  const today = new Date().toISOString().split('T')[0]
  const onHoliday = holidayRequests.value.some(request => 
    request.status === 'approved' &&
    request.start_date <= today &&
    request.end_date >= today
  )
  
  return onHoliday ? 'bg-yellow-400' : 'bg-green-400'
}

function getUserStatusClasses(user: User): string {
  const today = new Date().toISOString().split('T')[0]
  const onHoliday = holidayRequests.value.some(request => 
    request.status === 'approved' &&
    request.start_date <= today &&
    request.end_date >= today
  )
  
  return onHoliday 
    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
}

function getUserStatusText(user: User): string {
  const today = new Date().toISOString().split('T')[0]
  const onHoliday = holidayRequests.value.some(request => 
    request.status === 'approved' &&
    request.start_date <= today &&
    request.end_date >= today
  )
  
  return onHoliday ? 'On Holiday' : 'Active'
}

function getHolidayStatusClasses(status: string): string {
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

function getHolidayStatusText(status: string): string {
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

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dateString === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }
}

function formatDateRange(startDate: string, endDate: string): string {
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

async function exportUserData() {
  if (user.value) {
    await exportData(user.value.id, user.value.full_name)
  }
}

async function refreshUserData() {
  if (userId) {
    await fetchUserDetail(userId)
  }
}

// Lifecycle
onMounted(async () => {
  if (userId) {
    await fetchUserDetail(userId)
  }
})
</script>