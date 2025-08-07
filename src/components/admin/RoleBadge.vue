<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      roleClasses
    ]"
  >
    <svg :class="['w-2 h-2 mr-1', iconColor]" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
    {{ roleText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserRole } from '@/types'

interface Props {
  role: UserRole
}

const props = defineProps<Props>()

const roleClasses = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
    case 'employee':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
})

const iconColor = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'text-purple-500 dark:text-purple-400'
    case 'employee':
      return 'text-blue-500 dark:text-blue-400'
    default:
      return 'text-gray-400 dark:text-gray-500'
  }
})

const roleText = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'Admin'
    case 'employee':
      return 'Employee'
    default:
      return 'Unknown'
  }
})
</script>