<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">ClockIn</span>
          </router-link>
        </div>

        <!-- Navigation Items (only show when authenticated) -->
        <div v-if="isAuthenticated" class="hidden md:flex items-center space-x-8">
          <!-- Role Selector -->
          <RoleSelector v-if="isAdmin" />
          
          <!-- Navigation Links -->
          <div class="flex items-center space-x-6">
            <router-link
              v-if="currentView === 'employee' || !isAdmin"
              to="/employee"
              :class="[
                'text-sm font-medium transition-colors',
                $route.path === '/employee' 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              ]"
            >
              Dashboard
            </router-link>
            
            <router-link
              v-if="currentView === 'admin' && isAdmin"
              to="/admin"
              :class="[
                'text-sm font-medium transition-colors',
                $route.path === '/admin' 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              ]"
            >
              Team Overview
            </router-link>
            
            <router-link
              to="/settings"
              :class="[
                'text-sm font-medium transition-colors',
                $route.path === '/settings' 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              ]"
            >
              Settings
            </router-link>
          </div>
        </div>

        <!-- Right Side Items -->
        <div v-if="isAuthenticated" class="flex items-center space-x-4">
          <!-- Notification Bell -->
          <NotificationBell />
          
          <!-- User Profile Dropdown -->
          <UserProfileDropdown />
        </div>

        <!-- Login Button (when not authenticated) -->
        <div v-else>
          <router-link
            to="/login"
            class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <div v-if="isAuthenticated && showMobileMenu" class="md:hidden border-t border-gray-200 bg-white">
      <div class="px-4 py-3 space-y-3">
        <router-link
          v-if="currentView === 'employee' || !isAdmin"
          to="/employee"
          class="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
          @click="showMobileMenu = false"
        >
          Dashboard
        </router-link>
        
        <router-link
          v-if="currentView === 'admin' && isAdmin"
          to="/admin"
          class="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
          @click="showMobileMenu = false"
        >
          Team Overview
        </router-link>
        
        <router-link
          to="/settings"
          class="block text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
          @click="showMobileMenu = false"
        >
          Settings
        </router-link>
        
        <button
          @click="handleLogout"
          class="block w-full text-left text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import RoleSelector from './RoleSelector.vue'
import NotificationBell from './NotificationBell.vue'
import UserProfileDropdown from './UserProfileDropdown.vue'

// Composables
const { isAuthenticated, isAdmin, logout } = useAuth()
const route = useRoute()

// State
const showMobileMenu = ref(false)
const currentView = ref<'employee' | 'admin'>('employee')

// Computed
const isCurrentRoute = computed(() => (path: string) => route.path === path)

// Methods
async function handleLogout() {
  showMobileMenu.value = false
  await logout()
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

// Handle role switching
function handleRoleSwitch(role: 'employee' | 'admin') {
  currentView.value = role
}

// Expose methods for child components
defineExpose({
  handleRoleSwitch
})
</script>