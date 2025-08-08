<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <!-- Left Side - Illustration -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
      <div class="max-w-lg">
        <!-- SVG Illustration -->
        <div class="mb-8 flex justify-center">
          <img 
            src="/src/assets/time-management.svg" 
            alt="Time Management Illustration" 
            class="w-full h-auto max-w-md"
          />
        </div>
        
        <!-- Welcome Text -->
        <div class="text-center text-white">
          <h2 class="text-3xl font-bold mb-4">Welcome to ClockIn</h2>
          <p class="text-xl text-primary-100 leading-relaxed">
            Streamline your time tracking and manage your team's productivity with our modern, intuitive platform.
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <!-- Mobile Logo (only visible on small screens) -->
          <div class="lg:hidden mb-8">
            <div class="flex justify-center mb-4">
              <img 
                src="/src/assets/time-management.svg" 
                alt="Time Management Illustration" 
                class="w-48 h-auto"
              />
            </div>
          </div>
          
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">ClockIn</h1>
          <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Welcome back</h2>
          <p class="text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
        </div>

      <!-- Success message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-800">{{ successMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg space-y-6">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email address
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            autocomplete="email"
            required
            :class="[
              'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm',
              errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            ]"
            placeholder="Enter your email"
            :disabled="loading"
            @blur="touchedFields.email = true"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              :class="[
                'appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm',
                errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="Enter your password"
              :disabled="loading"
              @blur="touchedFields.password = true"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              :disabled="loading"
            >
              <svg
                v-if="showPassword"
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg
                v-else
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-primary-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <!-- Sign up link -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <router-link
              to="/signup"
              class="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign up here
            </router-link>
          </p>
        </div>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { validateLoginForm } from '@/types/validation'
import type { LoginCredentials } from '@/types'

// Composables
const { login, loading, error, clearError } = useAuth()
const route = useRoute()

// Form state
const formData = ref<LoginCredentials>({
  email: '',
  password: ''
})

const showPassword = ref(false)
const successMessage = ref<string | null>(null)

// Track which fields have been touched/interacted with
const touchedFields = ref<Record<string, boolean>>({
  email: false,
  password: false
})

const hasAttemptedSubmit = ref(false)

// Validation - only show errors for touched fields or after submit attempt
const allErrors = computed(() => validateLoginForm(formData.value))
const errors = computed(() => {
  const visibleErrors: Record<string, string> = {}
  
  // Only show errors for fields that have been touched or after submit attempt
  Object.keys(allErrors.value).forEach(field => {
    if (touchedFields.value[field] || hasAttemptedSubmit.value) {
      visibleErrors[field] = allErrors.value[field]
    }
  })
  
  return visibleErrors
})

const isFormValid = computed(() => {
  return formData.value.email && 
         formData.value.password && 
         Object.keys(allErrors.value).length === 0
})

// Methods
async function handleSubmit() {
  hasAttemptedSubmit.value = true
  
  if (!isFormValid.value) return

  clearError()
  
  try {
    const result = await login(formData.value)
    
    if (!result.success) {
      console.error('Login failed:', result.error)
      // Error will be displayed via the error computed property
    }
  } catch (err) {
    console.error('Login exception:', err)
    // Error will be displayed via the error computed property
  }
}

// Lifecycle
onMounted(() => {
  // Check for success message from query params
  if (route.query.message) {
    successMessage.value = route.query.message as string
  }
  
  // Clear any existing errors
  clearError()
})
</script>