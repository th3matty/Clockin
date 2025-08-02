<template>
  <ProtectedRoute :require-auth="true" require-role="employee">
    <Layout>
      <div class="max-w-7xl mx-auto py-6 px-4">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold text-gray-900">Welcome back, {{ user?.full_name }}!</h1>
          <p class="text-gray-600">Track your time and manage your schedule</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-500">Employee interface will be implemented in later tasks</p>
          <div class="mt-4 space-y-2">
            <p class="text-sm text-gray-600">User ID: {{ user?.id }}</p>
            <p class="text-sm text-gray-600">Email: {{ user?.email }}</p>
            <p class="text-sm text-gray-600">Role: {{ user?.role }}</p>
          </div>
        </div>
      </div>
    </Layout>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import ProtectedRoute from '@/components/auth/ProtectedRoute.vue'
import Layout from '@/components/shared/Layout.vue'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>