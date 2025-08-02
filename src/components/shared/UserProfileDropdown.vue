<template>
  <div class="relative">
    <!-- User Profile Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
    >
      <!-- User Avatar -->
      <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
        <img
          v-if="user?.avatar_url"
          :src="user.avatar_url"
          :alt="user.full_name"
          class="w-full h-full object-cover"
        />
        <span
          v-else
          class="text-sm font-medium text-primary-700"
        >
          {{ getInitials(user?.full_name || '') }}
        </span>
      </div>
      
      <!-- User Name (hidden on mobile) -->
      <span class="hidden sm:block text-sm font-medium text-gray-700">
        {{ user?.full_name }}
      </span>
      
      <!-- Dropdown Arrow -->
      <svg
        :class="[
          'w-4 h-4 text-gray-500 transition-transform',
          showDropdown ? 'rotate-180' : ''
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <!-- User Info Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="user?.avatar_url"
              :src="user.avatar_url"
              :alt="user.full_name"
              class="w-full h-full object-cover"
            />
            <span
              v-else
              class="text-sm font-medium text-primary-700"
            >
              {{ getInitials(user?.full_name || '') }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ user?.full_name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              ]"
            >
              {{ user?.role === 'admin' ? 'Administrator' : 'Employee' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="py-1">
        <router-link
          to="/settings"
          @click="closeDropdown"
          class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Account Settings
        </router-link>

        <button
          @click="toggleTheme"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>

        <div class="border-t border-gray-200 my-1"></div>

        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
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

// Composables
const { user, logout } = useAuth()

// State
const showDropdown = ref(false)
const isDarkMode = ref(false)

// Methods
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function closeDropdown() {
  showDropdown.value = false
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  // TODO: Implement theme switching logic
  console.log('Theme toggled:', isDarkMode.value ? 'dark' : 'light')
  closeDropdown()
}

async function handleLogout() {
  closeDropdown()
  await logout()
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