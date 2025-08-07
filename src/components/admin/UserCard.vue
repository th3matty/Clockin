<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative"
    @click="$emit('click')"
  >
    <!-- User Header -->
    <div class="flex items-center space-x-3 mb-3">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <SecureAvatar 
          :avatar-path="user.avatar_url"
          :name="user.full_name"
          size="md"
          :alt="user.full_name"
        />
      </div>
      
      <!-- User Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center flex-wrap gap-x-2 gap-y-1">
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors max-w-full">
            {{ user.full_name }}
          </h3>
          <!-- Status badge removed by request -->
        </div>
        <div class="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
          <RoleBadge :role="user.role" />
          <span class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
            {{ user.email }}
          </span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3 mb-3">      
      <!-- Weekly Hours -->
      <div class="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ user.weekly_hours.toFixed(1) }}h
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">This Week</div>
      </div>
    </div>

    <!-- Holiday Info -->
    <div class="flex items-center justify-between text-sm">
      <span class="text-gray-600 dark:text-gray-400">Holidays Remaining</span>
      <div class="flex items-center space-x-1">
        <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ user.remaining_holidays }}</span>
      </div>
    </div>

    <!-- Hover Effect Indicator -->
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import SecureAvatar from '@/components/shared/SecureAvatar.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import RoleBadge from '@/components/admin/RoleBadge.vue'
import type { AdminUser } from '@/types'

interface Props {
  user: AdminUser
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.group {
  position: relative;
}
</style>