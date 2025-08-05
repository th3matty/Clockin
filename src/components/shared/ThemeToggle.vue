<template>
  <div class="relative">
    <!-- Theme Toggle Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
      :title="`Current theme: ${getThemeLabel(theme)}`"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getThemeIcon(currentTheme)" />
      </svg>
    </button>

    <!-- Theme Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="py-1">
        <button
          v-for="themeOption in themeOptions"
          :key="themeOption"
          @click="handleThemeChange(themeOption)"
          :class="[
            'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3',
            theme === themeOption ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getThemeIcon(themeOption)" />
          </svg>
          <span>{{ getThemeLabel(themeOption) }}</span>
          <svg
            v-if="theme === themeOption"
            class="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div
      v-if="showDropdown"
      @click="showDropdown = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import type { Theme } from '@/stores/theme'

// Composables
const { user } = useAuth()
const {
  theme,
  currentTheme,
  setTheme,
  saveThemeToDatabase,
  getThemeIcon,
  getThemeLabel
} = useTheme()

// State
const showDropdown = ref(false)
const themeOptions: Theme[] = ['light', 'dark', 'system']

// Methods
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

async function handleThemeChange(newTheme: Theme) {
  setTheme(newTheme)
  showDropdown.value = false
  
  // Save to database if user is logged in
  if (user.value) {
    try {
      await saveThemeToDatabase(user.value.id)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>