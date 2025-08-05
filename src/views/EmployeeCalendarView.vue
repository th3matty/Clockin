<template>
  <ProtectedRoute :require-auth="true" require-role="employee">
    <Layout>
      <div class="max-w-7xl mx-auto py-6 px-4">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Holiday Calendar</h1>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Plan and manage your holiday requests</p>
            </div>
            <router-link
              to="/employee"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </router-link>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Holiday Calendar (2/3 width) -->
          <div class="lg:col-span-2">
            <HolidayCalendar />
          </div>

          <!-- Holiday Requests Sidebar (1/3 width) -->
          <div class="lg:col-span-1">
            <HolidayRequestsList />
          </div>
        </div>
      </div>
    </Layout>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import ProtectedRoute from '@/components/auth/ProtectedRoute.vue'
import Layout from '@/components/shared/Layout.vue'
import HolidayCalendar from '@/components/employee/HolidayCalendar.vue'
import HolidayRequestsList from '@/components/employee/HolidayRequestsList.vue'
</script>