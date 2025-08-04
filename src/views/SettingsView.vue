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
                    <input id="full_name" v-model="profileForm.full_name" type="text" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="profileLoading" />
                  </div>

                  <!-- Email (readonly) -->
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input id="email" :value="user?.email" type="email" readonly
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                    <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <!-- Profile Update Button -->
                <div class="flex justify-end">
                  <button type="submit" :disabled="profileLoading || !isProfileFormValid"
                    class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {{ profileLoading ? 'Updating...' : 'Update Profile' }}
                  </button>
                </div>

                <!-- Profile Success Message (positioned right after the button) -->
                <Transition enter-active-class="transition-all duration-300 ease-out"
                  enter-from-class="opacity-0 transform -translate-y-2"
                  enter-to-class="opacity-100 transform translate-y-0"
                  leave-active-class="transition-all duration-200 ease-in"
                  leave-from-class="opacity-100 transform translate-y-0"
                  leave-to-class="opacity-0 transform -translate-y-2">
                  <div v-if="showProfileSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm text-green-800">Profile updated successfully!</p>
                      </div>
                    </div>
                  </div>
                </Transition>
              </form>
            </div>
          </div>

          <!-- Working Hours Section -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Working Hours & Overtime Settings</h2>
              <p class="text-sm text-gray-600 mt-1">Set your weekly target hours and default daily schedule</p>
            </div>

            <div class="px-6 py-6">
              <form @submit.prevent="handleSettingsUpdate" class="space-y-6">
                <!-- Working Hours Configuration -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <!-- Weekly Target Hours -->
                  <div>
                    <label for="weekly_target_hours" class="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Target Hours
                    </label>
                    <input id="weekly_target_hours" v-model.number="settingsForm.weekly_target_hours" type="number"
                      min="20" max="60" step="0.5" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading" @input="settingsFormInitialized = true"
                      @change="settingsFormInitialized = true" />
                    <p class="text-xs text-gray-500 mt-1">Your contracted weekly working hours (20-60 hours)</p>
                  </div>

                  <!-- Working Days per Week -->
                  <div>
                    <label for="working_days_per_week" class="block text-sm font-medium text-gray-700 mb-2">
                      Working Days per Week
                    </label>
                    <select id="working_days_per_week" v-model.number="settingsForm.working_days_per_week" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading" @change="settingsFormInitialized = true">
                      <option value="1">1 day</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="4">4 days</option>
                      <option value="5">5 days</option>
                      <option value="6">6 days</option>
                      <option value="7">7 days</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">How many days per week do you work?</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Start Time -->
                  <div>
                    <label for="start_time" class="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input id="start_time" v-model="settingsForm.default_start_time" type="time" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading" @input="settingsFormInitialized = true"
                      @change="settingsFormInitialized = true" />
                  </div>

                  <!-- Lunch Break -->
                  <div>
                    <label for="lunch_minutes" class="block text-sm font-medium text-gray-700 mb-2">
                      Lunch Break (minutes)
                    </label>
                    <input id="lunch_minutes" v-model.number="settingsForm.default_lunch_minutes" type="number" min="0"
                      max="480" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading" @input="settingsFormInitialized = true"
                      @change="settingsFormInitialized = true" />
                    <p class="text-xs text-gray-500 mt-1">0-480 minutes (0-8 hours)</p>
                  </div>

                  <!-- End Time -->
                  <div>
                    <label for="end_time" class="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input id="end_time" v-model="settingsForm.default_end_time" type="time" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      :disabled="settingsLoading" @input="settingsFormInitialized = true"
                      @change="settingsFormInitialized = true" />
                  </div>
                </div>

                <!-- Working Hours Preview -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="text-sm font-medium text-gray-900 mb-2">Preview</h3>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p><span class="font-medium">Weekly Target:</span> {{ settingsForm.weekly_target_hours || 40 }} hours/week</p>
                    <p><span class="font-medium">Working Days:</span> {{ settingsForm.working_days_per_week || 5 }} days/week</p>
                    <p><span class="font-medium">Daily Target:</span> {{ calculateDailyTargetHours() }} hours/day</p>
                    <div v-if="isDailyTargetValid()" class="flex items-center text-green-600">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="text-xs">Valid daily hours (≤ 12h/day)</span>
                    </div>
                    <div v-else class="flex items-center text-red-600">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      <span class="text-xs">Daily target exceeds 12 hours - please adjust your settings</span>
                    </div>
                    <p><span class="font-medium">Working Day:</span> {{ settingsForm.default_start_time }} - {{
                      settingsForm.default_end_time }}</p>
                    <p><span class="font-medium">Lunch Break:</span> {{ settingsForm.default_lunch_minutes }} minutes</p>
                    <p><span class="font-medium">Daily Working Hours:</span> {{ calculateWorkingHours() }} hours</p>
                  </div>
                </div>

                <!-- Validation Errors -->
                <div v-if="settingsFormInitialized && validationErrors.length > 0"
                  class="bg-red-50 border border-red-200 rounded-md p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clip-rule="evenodd" />
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
                  <button type="submit" :disabled="settingsLoading || validationErrors.length > 0"
                    class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {{ settingsLoading ? 'Updating...' : 'Update Working Hours' }}
                  </button>
                </div>

                <!-- Settings Success Message (positioned right after the button) -->
                <Transition enter-active-class="transition-all duration-300 ease-out"
                  enter-from-class="opacity-0 transform -translate-y-2"
                  enter-to-class="opacity-100 transform translate-y-0"
                  leave-active-class="transition-all duration-200 ease-in"
                  leave-from-class="opacity-100 transform translate-y-0"
                  leave-to-class="opacity-0 transform -translate-y-2">
                  <div v-if="showSettingsSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm text-green-800">Working hours updated successfully!</p>
                      </div>
                    </div>
                  </div>
                </Transition>
              </form>
            </div>
          </div>








        </div>
      </div>
    </Layout>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, Transition } from 'vue'
import ProtectedRoute from '@/components/auth/ProtectedRoute.vue'
import Layout from '@/components/shared/Layout.vue'
import AvatarUpload from '@/components/shared/AvatarUpload.vue'
import { useAuth } from '@/composables/useAuth'
import { useUserSettings } from '@/composables/useUserSettings'
import { useOvertimeBalance } from '@/composables/useOvertimeBalance'
import type { UserSettingsFormData } from '@/types'

// Composables
const { user, updateProfile } = useAuth()
const { currentSettings, updateSettings, validateTimeSettings, loading, error, clearError } = useUserSettings()
const { calculateDailyTarget, validateDailyTarget, validateWorkingDaysSettings } = useOvertimeBalance()

// Form state
const profileForm = ref({
  full_name: ''
})

const settingsForm = ref<UserSettingsFormData>({
  default_start_time: '09:00',
  default_lunch_minutes: 60,
  default_end_time: '17:00',
  weekly_target_hours: 40.0,
  working_days_per_week: 5
})

// Loading states
const profileLoading = ref(false)
const settingsLoading = ref(false)

// Success states
const showProfileSuccess = ref(false)
const showSettingsSuccess = ref(false)

// Form initialization state
const settingsFormInitialized = ref(false)

// Computed
const isProfileFormValid = computed(() => {
  return profileForm.value.full_name.trim().length >= 2
})

const validationErrors = computed(() => {
  // Only validate if the form has been initialized with user settings
  if (!settingsFormInitialized.value) {
    return []
  }

  // Additional check: only validate if we have actual user data
  if (!user.value || !currentSettings.value) {
    return []
  }

  const timeErrors = validateTimeSettings(settingsForm.value)
  const workingDaysErrors = validateWorkingDaysSettings(
    settingsForm.value.weekly_target_hours || 40,
    settingsForm.value.working_days_per_week || 5
  )

  return [...timeErrors, ...workingDaysErrors]
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

function calculateDailyTargetHours(): string {
  const weeklyHours = settingsForm.value.weekly_target_hours || 40
  const workingDays = settingsForm.value.working_days_per_week || 5
  const dailyTarget = calculateDailyTarget(weeklyHours, workingDays)
  return dailyTarget.toFixed(1)
}

function isDailyTargetValid(): boolean {
  const weeklyHours = settingsForm.value.weekly_target_hours || 40
  const workingDays = settingsForm.value.working_days_per_week || 5
  return validateDailyTarget(weeklyHours, workingDays)
}

async function handleProfileUpdate(event: { preventDefault: () => void }) {
  event?.preventDefault()
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
    // Handle error silently
  } finally {
    profileLoading.value = false
  }
}

async function handleSettingsUpdate(event: { preventDefault: () => void }) {
  event?.preventDefault()
  // Ensure form is marked as initialized for validation
  settingsFormInitialized.value = true

  if (validationErrors.value.length > 0) return

  try {
    settingsLoading.value = true
    clearError()

    const result = await updateSettings({
      default_start_time: settingsForm.value.default_start_time,
      default_lunch_minutes: settingsForm.value.default_lunch_minutes,
      default_end_time: settingsForm.value.default_end_time,
      weekly_target_hours: settingsForm.value.weekly_target_hours,
      working_days_per_week: settingsForm.value.working_days_per_week
    })

    if (result.success) {
      showSettingsSuccess.value = true
      setTimeout(() => {
        showSettingsSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    // Handle error silently
  } finally {
    settingsLoading.value = false
  }
}

// Initialize form data
function initializeForms() {
  if (user.value) {
    profileForm.value.full_name = user.value.full_name
  }

  // Only initialize settings form if we have complete user data
  if (currentSettings.value && !settingsLoading.value && user.value) {
    // Ensure we have valid time values before initializing
    const startTime = currentSettings.value.default_start_time
    const endTime = currentSettings.value.default_end_time
    const lunchMinutes = currentSettings.value.default_lunch_minutes

    // Check if we have valid time values (not null, undefined, or empty)
    if (startTime && endTime && typeof lunchMinutes === 'number') {
      settingsForm.value = {
        default_start_time: startTime.slice(0, 5), // Convert HH:MM:SS to HH:MM
        default_lunch_minutes: lunchMinutes,
        default_end_time: endTime.slice(0, 5), // Convert HH:MM:SS to HH:MM
        weekly_target_hours: currentSettings.value.weekly_target_hours ?? 40.0,
        working_days_per_week: currentSettings.value.working_days_per_week ?? 5
      }
      // Only mark as initialized if we have valid data
      settingsFormInitialized.value = true
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