<template>
  <ProtectedRoute :require-auth="true" require-role="admin">
    <Layout>
      <div class="max-w-7xl mx-auto py-6 px-4">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your team and monitor activity</p>
            </div>
            
            <!-- Quick Stats -->
            <div class="hidden md:flex items-center space-x-8 text-sm">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalTeamMembers }}</div>
                <div class="text-gray-500 dark:text-gray-400">Total Members</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ pendingRequests }}</div>
                <div class="text-gray-500 dark:text-gray-400">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Team Members Grid (2/3 width) -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Team Members</h2>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ teamMembers.length }} members</span>
                </div>
              </div>
              
              <div class="p-6">
                <!-- Loading State -->
                <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div v-for="i in 6" :key="i" class="animate-pulse">
                    <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-40"></div>
                  </div>
                </div>

                <!-- Team Members Grid -->
                <div v-else-if="teamMembers.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <UserCard
                    v-for="member in teamMembers"
                    :key="member.id"
                    :user="member"
                    @click="viewUserDetail(member)"
                  />
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-12">
                  <svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400">No team members found</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Feed Sidebar (1/3 width) -->
          <div class="lg:col-span-1">
            <ActivityFeed @activities-updated="fetchTeamMembers" />
          </div>
        </div>
      </div>
    </Layout>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProtectedRoute from '@/components/auth/ProtectedRoute.vue'
import Layout from '@/components/shared/Layout.vue'
import UserCard from '@/components/admin/UserCard.vue'
import ActivityFeed from '@/components/admin/ActivityFeed.vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import { useNotificationSync } from '@/composables/useNotificationSync'
import type { AdminUser } from '@/types'

// Composables
const router = useRouter()
const { teamMembers, loading, fetchTeamMembers, fetchActivities, totalTeamMembers, pendingRequests } = useAdminDashboard()
const { syncNotifications } = useNotificationSync()

function viewUserDetail(user: AdminUser) {
  router.push(`/admin/user/${user.id}`)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchTeamMembers(),
    fetchActivities(),
    syncNotifications('admin-dashboard-load')
  ])
})
</script>