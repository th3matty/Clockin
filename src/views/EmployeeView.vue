<template>
  <ProtectedRoute :require-auth="true" require-role="employee">
    <Layout>
      <div class="max-w-7xl mx-auto py-6 px-4">
        <!-- Welcome Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Welcome back, {{ user?.full_name }}!</h1>
          <p class="text-gray-600 mt-2">Track your time and manage your schedule</p>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Time Entry Form (2/3 width) -->
          <div class="lg:col-span-2">
            <TimeEntryForm />
          </div>

          <!-- Quick Stats Sidebar (1/3 width) -->
          <div class="lg:col-span-1">
            <QuickStats @request-holiday="handleHolidayRequest" />
          </div>
        </div>

        <!-- Recent Entries Section -->
        <div class="mt-8">
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Recent Time Entries</h2>
            </div>
            <div class="px-6 py-4">
              <div v-if="loading" class="text-center py-8">
                <svg class="animate-spin h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <p class="text-gray-500 mt-2">Loading entries...</p>
              </div>

              <div v-else-if="recentEntries.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-500">No time entries yet</p>
                <p class="text-sm text-gray-400 mt-1">Start by adding your first time entry above</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="entry in recentEntries" :key="entry.id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ formatDate(entry.date) }}</p>
                      <p class="text-sm text-gray-500">
                        {{ entry.start_time.slice(0, 5) }} - {{ entry.end_time.slice(0, 5) }}
                        <span v-if="entry.lunch_break_minutes > 0">
                          ({{ entry.lunch_break_minutes }}min lunch)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-semibold text-gray-900">{{ entry.total_hours.toFixed(1) }}h</p>
                    <p class="text-xs text-gray-500">Total hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ProtectedRoute from '@/components/auth/ProtectedRoute.vue'
import Layout from '@/components/shared/Layout.vue'
import TimeEntryForm from '@/components/employee/TimeEntryForm.vue'
import QuickStats from '@/components/employee/QuickStats.vue'
import { useAuth } from '@/composables/useAuth'
import { useTimeEntries } from '@/composables/useTimeEntries'

// Composables
const { user } = useAuth()
const { loading, timeEntries, fetchTimeEntries } = useTimeEntries()

// Computed
const recentEntries = computed(() => {
  return timeEntries.value.slice(0, 5) // Show last 5 entries
})

// Methods
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

function handleHolidayRequest() {
  // TODO: Implement holiday request modal
  console.log('Holiday request clicked')
}

// Lifecycle
onMounted(async () => {
  // Fetch recent time entries
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  await fetchTimeEntries(thirtyDaysAgo.toISOString().split('T')[0])
})
</script>