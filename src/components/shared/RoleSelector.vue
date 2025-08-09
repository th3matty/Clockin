<template>
  <div class="relative">
    <!-- Role Selector Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    >
      <span class="capitalize">{{ currentRole }} View</span>
      <svg
        :class="[
          'w-4 h-4 transition-transform',
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
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-50"
    >
      <div class="py-1">
        <button
          @click="switchRole('employee')"
          :class="[
            'w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3',
            currentRole === 'employee'
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <div class="font-medium">Employee View</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Track time and manage schedule</div>
          </div>
          <svg
            v-if="currentRole === 'employee'"
            class="w-4 h-4 text-primary-600 ml-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <button
          @click="switchRole('admin')"
          :class="[
            'w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3',
            currentRole === 'admin'
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <div>
            <div class="font-medium">Admin View</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Manage team and operations</div>
          </div>
          <svg
            v-if="currentRole === 'admin'"
            class="w-4 h-4 text-primary-600 ml-auto"
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
import { useRouter, useRoute } from 'vue-router'

// Props & Emits
const emit = defineEmits<{
  roleChanged: [role: 'employee' | 'admin']
}>()

// Composables
const router = useRouter()
const route = useRoute()

// State
const showDropdown = ref(false)
const currentRole = ref<'employee' | 'admin'>('employee')

// Methods
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

async function switchRole(role: 'employee' | 'admin') {
  if (currentRole.value === role) {
    showDropdown.value = false
    return
  }

  currentRole.value = role
  showDropdown.value = false
  
  // Emit role change event
  emit('roleChanged', role)
  
  // Navigate to appropriate dashboard
  const targetPath = role === 'admin' ? '/admin' : '/employee'
  const currentBasePath = route.path.startsWith('/admin') ? '/admin' : '/employee'
  
  if (currentBasePath !== targetPath) {
    await router.push(targetPath)
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
  // Set initial role based on current route
  if (route.path.startsWith('/admin')) {
    currentRole.value = 'admin'
  } else {
    currentRole.value = 'employee'
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>