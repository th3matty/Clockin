<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      statusClasses
    ]"
  >
    <svg :class="['w-2 h-2 mr-1', dotColor]" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserStatus } from '@/types'

interface Props {
  status: UserStatus
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  switch (props.status) {
    case 'active':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    case 'inactive':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    case 'on_holiday':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
})

const dotColor = computed(() => {
  switch (props.status) {
    case 'active':
      return 'text-green-500 dark:text-green-400'
    case 'inactive':
      return 'text-gray-400 dark:text-gray-500'
    case 'on_holiday':
      return 'text-orange-500 dark:text-orange-400'
    default:
      return 'text-gray-400 dark:text-gray-500'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'active':
      return 'Active'
    case 'inactive':
      return 'Inactive'
    case 'on_holiday':
      return 'On Holiday'
    default:
      return 'Unknown'
  }
})
</script>