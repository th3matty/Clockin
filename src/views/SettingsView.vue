<template>
  <ProtectedRoute :require-auth="true">
    <Layout>
      <div class="max-w-4xl mx-auto py-6 px-4">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">Account Settings</h1>
          <p class="text-gray-600 mt-1">Manage your profile and default working hours</p>
        </div>

        <div class="space-y-8">
          <!-- Profile Section -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Profile Information</h2>
              <p class="text-sm text-gray-600 mt-1">Update your profile photo and basic information</p>
            </div>
            
            <div class="px-6 py-6">
              <!-- Avatar Upload -->
              <div class="mb-8">
                <label class="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
                <AvatarUpload />
              </div>

              <!-- Basic Info Form -->
              <form @submit.prevent="handleProfileUpdate" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Full Name -->
                  <div>
                    <label for="full_name" class="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="full_name"
                      v-model="profileForm.full_name"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="profileLoading"
                    />
                  </div>

                  <!-- Email (readonly) -->
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      :value="user?.email"
                      type="email"
                      readonly
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <!-- Profile Update Button -->
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="profileLoading || !isProfileFormValid"
                    class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ profileLoading ? 'Updating...' : 'Update Profile' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Working Hours Section -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Default Working Hours</h2>
              <p class="text-sm text-gray-600 mt-1">Set your default start time, lunch break, and end time</p>
            </div>
            
            <div class="px-6 py-6">
              <form @submit.prevent="handleSettingsUpdate" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Start Time -->
                  <div>
                    <label for="start_time" class="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      id="start_time"
                      v-model="settingsForm.default_start_time"
                      type="time"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading"
                    />
                  </div>

                  <!-- Lunch Break -->
                  <div>
                    <label for="lunch_minutes" class="block text-sm font-medium text-gray-700 mb-2">
                      Lunch Break (minutes)
                    </label>
                    <input
                      id="lunch_minutes"
                      v-model.number="settingsForm.default_lunch_minutes"
                      type="number"
                      min="0"
                      max="480"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading"
                    />
                    <p class="text-xs text-gray-500 mt-1">0-480 minutes (0-8 hours)</p>
                  </div>

                  <!-- End Time -->
                  <div>
                    <label for="end_time" class="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      id="end_time"
                      v-model="settingsForm.default_end_time"
                      type="time"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading"
                    />
                  </div>
                </div>

                <!-- Working Hours Preview -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Preview</h3>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p><span class="font-medium">Working Day:</span> {{ settingsForm.default_start_time }} - {{ settingsForm.default_end_time }}</p>
                    <p><span class="font-medium">Lunch Break:</span> {{ settingsForm.default_lunch_minutes }} minutes</p>
                    <p><span class="font-medium">Total Working Hours:</span> {{ calculateWorkingHours() }} hours</p>
                  </div>
                </div>

                <!-- Validation Errors -->
                <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                      <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                        <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Settings Update Button -->
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="settingsLoading || validationErrors.length > 0"
                    class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ settingsLoading ? 'Updating...' : 'Update Working Hours' }}
                  </button>
                </div>
              </form>
            </div>
          </div>



          <!-- Success Messages -->
          <div v-if="showProfileSuccess" class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-800">Profile updated successfully!</p>
              </div>
            </div>
          </div>

          <!-- Debug: Show current state -->
          <div class="text-xs text-gray-500 mb-2">
            Debug: showSettingsSuccess = {{ showSettingsSuccess }}
          </div>

          <div v-if="showSettingsSuccess" class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-800">Working hours updated successfully!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ProtectedRoute from '@/components/auth/ProtectedRoute.vue'
import Layout from '@/components/shared/Layout.vue'
import AvatarUpload from '@/components/shared/AvatarUpload.vue'
import { useAuth } from '@/composables/useAuth'
import { useUserSettings } from '@/composables/useUserSettings'
import type { UserSettingsFormData } from '@/types'

// Composables
const { user, updateProfile } = useAuth()
const { currentSettings, updateSettings, validateTimeSettings, loading, error, clearError } = useUserSettings()

// Form state
const profileForm = ref({
  full_name: ''
})

const settingsForm = ref<UserSettingsFormData>({
  default_start_time: '09:00',
  default_lunch_minutes: 60,
  default_end_time: '17:00'
})

// Loading states
const profileLoading = ref(false)
const settingsLoading = ref(false)

// Success states
const showProfileSuccess = ref(false)
const showSettingsSuccess = ref(false)

// Computed
const isProfileFormValid = computed(() => {
  return profileForm.value.full_name.trim().length >= 2
})

const validationErrors = computed(() => {
  return validateTimeSettings(settingsForm.value)
})

// Methods
function calculateWorkingHours(): string {
  try {
    const start = new Date(`2000-01-01T${settingsForm.value.default_start_time}:00`)
    const end = new Date(`2000-01-01T${settingsForm.value.default_end_time}:00`)
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    const workingMinutes = totalMinutes - settingsForm.value.default_lunch_minutes
    const hours = Math.max(0, workingMinutes / 60)
    return hours.toFixed(1)
  } catch {
    return '0.0'
  }
}

async function handleProfileUpdate() {
  if (!isProfileFormValid.value) return

  try {
    profileLoading.value = true
    clearError()

    const result = await updateProfile({
      full_name: profileForm.value.full_name.trim()
    })

    if (result.success) {
      showProfileSuccess.value = true
      setTimeout(() => {
        showProfileSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    console.error('Profile update error:', err)
  } finally {
    profileLoading.value = false
  }
}

async function handleSettingsUpdate() {
  if (validationErrors.value.length > 0) return

  try {
    settingsLoading.value = true
    clearError()

    const result = await updateSettings({
      default_start_time: settingsForm.value.default_start_time,
      default_lunch_minutes: settingsForm.value.default_lunch_minutes,
      default_end_time: settingsForm.value.default_end_time
    })

    console.log('Settings update result:', result)

    if (result.success) {
      console.log('Showing success message')
      showSettingsSuccess.value = true
      console.log('showSettingsSuccess set to:', showSettingsSuccess.value)
      setTimeout(() => {
        console.log('Hiding success message after 3 seconds')
        showSettingsSuccess.value = false
      }, 3000)
    } else {
      console.log('Update failed:', result.error)
    }
  } catch (err) {
    console.error('Settings update error:', err)
  } finally {
    settingsLoading.value = false
  }
}

// Initialize form data
function initializeForms() {
  console.log('Initializing forms, loading states:', { settingsLoading: settingsLoading.value, profileLoading: profileLoading.value })
  
  if (user.value) {
    profileForm.value.full_name = user.value.full_name
  }

  if (currentSettings.value && !settingsLoading.value) {
    console.log('Setting form values from currentSettings:', currentSettings.value)
    settingsForm.value = {
      default_start_time: currentSettings.value.default_start_time,
      default_lunch_minutes: currentSettings.value.default_lunch_minutes,
      default_end_time: currentSettings.value.default_end_time
    }
  }
}

// Watchers
watch(user, () => {
  // Only initialize forms if we're not currently updating settings
  if (!settingsLoading.value && !profileLoading.value) {
    initializeForms()
  }
}, { immediate: true })

watch(error, (newError) => {
  if (newError) {
    showProfileSuccess.value = false
    showSettingsSuccess.value = false
  }
})

// Lifecycle
onMounted(() => {
  initializeForms()
})
</script>