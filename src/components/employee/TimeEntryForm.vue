<template>
  <div :class="[
    'rounded-xl shadow-lg p-8 transition-all duration-300',
    existingEntry ? 'bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-400' : 'bg-white dark:bg-gray-800'
  ]">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Time Entry</h2>
        <div v-if="existingEntry" class="flex items-center gap-2">
          <div class="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            Saved
          </span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div>
            <p class="text-gray-600 dark:text-gray-400">{{ formatDate(selectedDate) }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You can adjust working hours for the last 7 days only
            </p>
          </div>
        </div>
        <input :value="selectedDate" type="date" :min="minSelectableDate" :max="maxSelectableDate"
          class="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @input="handleDateInput" />
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Time Inputs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Start Time -->
        <div>
          <label for="start_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Time
          </label>
          <input id="start_time" v-model="formData.start_time" type="time" required :class="[
            'w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-gray-700 dark:text-gray-100',
            validationErrors.includes('Start time must be in HH:MM format') || validationErrors.includes('End time must be after start time')
              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600'
          ]" :disabled="loading" />
        </div>

        <!-- Lunch Break -->
        <div>
          <label for="lunch_minutes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lunch Break (minutes)
          </label>
          <input id="lunch_minutes" v-model.number="formData.lunch_break_minutes" type="number" min="0" max="480"
            required :class="[
              'w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-gray-700 dark:text-gray-100',
              validationErrors.includes('Lunch break must be between 0 and 480 minutes')
                ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600'
            ]" :disabled="loading" />
        </div>

        <!-- End Time -->
        <div>
          <label for="end_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Time
          </label>
          <input id="end_time" v-model="formData.end_time" type="time" required :class="[
            'w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-gray-700 dark:text-gray-100',
            validationErrors.includes('End time must be in HH:MM format') || validationErrors.includes('End time must be after start time')
              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600'
          ]" :disabled="loading" />
        </div>
      </div>

      <!-- Overtime Hours Field -->
      <div>
        <label for="overtime_hours" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Overtime Hours (Optional)
        </label>
        <input id="overtime_hours" v-model.number="formData.overtime_hours" type="number" min="0" max="10" step="0.25"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder="0.00" :disabled="loading" />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter additional hours worked beyond regular schedule
          (0-2 hours)</p>
      </div>

      <!-- Total Hours Display -->
      <div :class="[
        'rounded-lg p-4 transition-all duration-300',
        existingEntry
          ? 'bg-gray-50 dark:bg-gray-700 border-2 border-green-500 dark:border-green-400'
          : 'bg-gray-50 dark:bg-gray-700'
      ]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Total Working Hours:</span>
            <div v-if="existingEntry" class="flex items-center text-green-600 dark:text-green-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div class="text-right">
            <span :class="[
              'text-2xl font-bold',
              existingEntry ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400'
            ]">
              {{ (calculatedHours + (formData.overtime_hours || 0)).toFixed(1) }}h
            </span>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ calculatedHours.toFixed(1) }}h regular
              <span v-if="formData.overtime_hours && formData.overtime_hours > 0"
                class="text-orange-600 dark:text-orange-400">
                + {{ formData.overtime_hours.toFixed(1) }}h overtime
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-1">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ formData.start_time }} - {{ formData.end_time }}
            <span v-if="formData.lunch_break_minutes > 0">
              ({{ formData.lunch_break_minutes }}min lunch)
            </span>
          </div>
          <div v-if="existingEntry" class="text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ Saved to database
          </div>
        </div>
      </div>

      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-4">
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

      <!-- API Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-3">
        <button v-if="existingEntry" @click="handleDelete" type="button" :disabled="loading"
          class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Delete Entry
        </button>

        <button type="submit" :disabled="loading || validationErrors.length > 0"
          class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ loading ? 'Saving...' : (existingEntry ? 'Update Entry' : 'Save Entry') }}
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <div v-if="showSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800">
            {{ existingEntry ? 'Time entry updated successfully!' : 'Time entry saved successfully!' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTimeEntries } from '@/composables/useTimeEntries'
import type { TimeEntryFormData, TimeEntry } from '@/types'

// Composables
const { user } = useAuth()
const {
  loading,
  error,
  timeEntries,
  todayEntry,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  calculateTotalHours,
  validateTimeEntry,
  clearError,
  fetchTimeEntries
} = useTimeEntries()

// State - Use a completely independent date state
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showSuccess = ref(false)
const existingEntry = ref<TimeEntry | null>(null)
const preventDateReset = ref(false)

// Safety mechanism to prevent stuck loading states
let loadingTimeout: NodeJS.Timeout | null = null

// Watch loading state and set a timeout to reset it if it gets stuck
watch(loading, (isLoading) => {
  if (isLoading) {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
    }
    // Set a 10-second timeout to reset loading state if it gets stuck
    loadingTimeout = setTimeout(() => {
      // Note: We don't force reset the loading state here as it's managed by the composable
      // But we log it for debugging
    }, 10000)
  } else {
    // Clear timeout when loading completes normally
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
  }
})

const formData = ref<TimeEntryFormData>({
  start_time: '09:00',
  lunch_break_minutes: 60,
  end_time: '17:00',
  overtime_hours: 0
})

// Computed - Remove this computed that might be interfering
// const today = computed(() => new Date().toISOString().split('T')[0])

const calculatedHours = computed(() => {
  return calculateTotalHours(
    formData.value.start_time,
    formData.value.end_time,
    formData.value.lunch_break_minutes
  )
})

const validationErrors = computed(() => {
  return validateTimeEntry(formData.value)
})

// Date restrictions - allow only last 7 days including today
const minSelectableDate = computed(() => {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6) // 6 days ago + today = 7 days total
  return sevenDaysAgo.toISOString().split('T')[0]
})

const maxSelectableDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Methods
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function initializeFormData() {
  // Use user's default settings if available
  if (user.value) {
    formData.value = {
      start_time: user.value.default_start_time?.slice(0, 5) || '09:00',
      lunch_break_minutes: user.value.default_lunch_minutes || 60,
      end_time: user.value.default_end_time?.slice(0, 5) || '17:00',
      overtime_hours: 0
    }
  }

  // If there's an existing entry for the selected date, use its values
  if (existingEntry.value) {
    formData.value = {
      start_time: existingEntry.value.start_time.slice(0, 5),
      lunch_break_minutes: existingEntry.value.lunch_break_minutes,
      end_time: existingEntry.value.end_time.slice(0, 5),
      overtime_hours: existingEntry.value.overtime_hours || 0
    }
  }
}

function handleDateInput(event: Event) {
  const target = event.target as HTMLInputElement
  const newDate = target.value

  if (!newDate) return

  // Validate that the selected date is within the allowed range
  const selectedDateObj = new Date(newDate)
  const minDate = new Date(minSelectableDate.value)
  const maxDate = new Date(maxSelectableDate.value)

  if (selectedDateObj < minDate || selectedDateObj > maxDate) {
    // Reset to today if date is outside allowed range
    const today = new Date().toISOString().split('T')[0]
    selectedDate.value = today
    target.value = today
    loadDataForDate(today)
    return
  }

  // Update the selectedDate FIRST, before any async operations
  selectedDate.value = newDate

  // Then handle the data loading asynchronously without affecting the date
  loadDataForDate(newDate)
}

async function loadDataForDate(date: string) {
  clearError()

  try {
    // Check if we already have entries loaded that include this date
    const existingEntryForDate = timeEntries.value.find(entry => entry.date === date)

    if (existingEntryForDate) {
      existingEntry.value = existingEntryForDate
      initializeFormData()
      return
    }

    // Only fetch if we don't have the entry in cache
    const result = await fetchTimeEntries(date, date)

    // Find entry for selected date after fetch
    const entry = timeEntries.value.find(entry => entry.date === date)
    existingEntry.value = entry || null

    initializeFormData()
  } catch (err) {
    // Handle error silently
  }
}

async function handleSubmit() {
  if (validationErrors.value.length > 0) return

  // Preserve the current date
  const currentDate = selectedDate.value
  preventDateReset.value = true

  clearError()

  try {
    const entryData = {
      date: selectedDate.value,
      start_time: formData.value.start_time,
      end_time: formData.value.end_time,
      lunch_break_minutes: formData.value.lunch_break_minutes,
      overtime_hours: formData.value.overtime_hours || 0
    }

    let result
    if (existingEntry.value) {
      result = await updateTimeEntry(existingEntry.value.id, entryData)
    } else {
      result = await createTimeEntry(entryData)
    }

    if (result.success) {
      showSuccess.value = true
      existingEntry.value = result.data

      // Ensure date stays the same
      selectedDate.value = currentDate

      // Hide success message after 3 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    // Handle error silently
  } finally {
    // Ensure date is preserved and allow changes again
    selectedDate.value = currentDate
    setTimeout(() => {
      preventDateReset.value = false
    }, 100)
  }
}

async function handleDelete() {
  if (!existingEntry.value) return

  if (!confirm('Are you sure you want to delete this time entry?')) return

  // Preserve the current date
  const currentDate = selectedDate.value
  preventDateReset.value = true

  clearError()

  // Add a local timeout as a safety mechanism for delete operations
  const deleteTimeout = setTimeout(() => {
    // If loading is still true after 10 seconds, something went wrong
    if (loading.value) {
      console.warn('Delete operation timed out - this may indicate a network or server issue')
    }
  }, 10000)

  try {
    const result = await deleteTimeEntry(existingEntry.value.id)

    // Clear the timeout since the operation completed
    clearTimeout(deleteTimeout)

    if (result.success) {
      existingEntry.value = null
      initializeFormData() // Reset to defaults
      showSuccess.value = true

      // Ensure date stays the same
      selectedDate.value = currentDate

      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    // Clear the timeout on error as well
    clearTimeout(deleteTimeout)
    // Handle error silently
  } finally {
    // Ensure date is preserved and allow changes again
    selectedDate.value = currentDate
    setTimeout(() => {
      preventDateReset.value = false
    }, 100)
  }
}

// Watchers
// Removed date watcher - using direct input handler instead

watch(error, (newError) => {
  if (newError) {
    showSuccess.value = false
  }
})

// Watch for user changes to update form defaults
watch(user, () => {
  // Only reinitialize if there's no existing entry for the current date
  if (!existingEntry.value) {
    initializeFormData()
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  try {
    // Set initial date to today only if no date is selected
    if (!selectedDate.value) {
      selectedDate.value = new Date().toISOString().split('T')[0]
    }

    // Validate that the current selected date is within the allowed range
    const selectedDateObj = new Date(selectedDate.value)
    const minDate = new Date(minSelectableDate.value)
    const maxDate = new Date(maxSelectableDate.value)

    if (selectedDateObj < minDate || selectedDateObj > maxDate) {
      // Reset to today if date is outside allowed range
      selectedDate.value = new Date().toISOString().split('T')[0]
    }

    // Fetch entries for current month to have a good cache
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

    const result = await fetchTimeEntries(startOfMonth, endOfMonth)

    // Find entry for the currently selected date
    existingEntry.value = timeEntries.value.find(entry => entry.date === selectedDate.value) || null
    initializeFormData()

    // Mark as initialized to enable watchers
    // Component is now initialized
  } catch (err) {
    // Initialize with defaults even if fetch fails
    if (!selectedDate.value) {
      selectedDate.value = new Date().toISOString().split('T')[0]
    }
    initializeFormData()
    // Component is now initialized
  }
})
</script>