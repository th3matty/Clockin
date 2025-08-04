<template>
  <div class="bg-white rounded-xl shadow-lg p-8">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Time Entry</h2>
      <div class="flex items-center justify-between">
        <p class="text-gray-600">{{ formatDate(selectedDate) }}</p>
        <input
          v-model="selectedDate"
          type="date"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          :max="today"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Time Inputs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Start Time -->
        <div>
          <label for="start_time" class="block text-sm font-medium text-gray-700 mb-2">
            Start Time
          </label>
          <input
            id="start_time"
            v-model="formData.start_time"
            type="time"
            required
            :class="[
              'w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
              validationErrors.includes('Start time must be in HH:MM format') || validationErrors.includes('End time must be after start time')
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            ]"
            :disabled="loading"
          />
        </div>

        <!-- Lunch Break -->
        <div>
          <label for="lunch_minutes" class="block text-sm font-medium text-gray-700 mb-2">
            Lunch Break (minutes)
          </label>
          <input
            id="lunch_minutes"
            v-model.number="formData.lunch_break_minutes"
            type="number"
            min="0"
            max="480"
            required
            :class="[
              'w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
              validationErrors.includes('Lunch break must be between 0 and 480 minutes')
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            ]"
            :disabled="loading"
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
            v-model="formData.end_time"
            type="time"
            required
            :class="[
              'w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
              validationErrors.includes('End time must be in HH:MM format') || validationErrors.includes('End time must be after start time')
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            ]"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- Total Hours Display -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Total Working Hours:</span>
          <span class="text-2xl font-bold text-primary-600">
            {{ calculatedHours.toFixed(1) }}h
          </span>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ formData.start_time }} - {{ formData.end_time }} 
          <span v-if="formData.lunch_break_minutes > 0">
            ({{ formData.lunch_break_minutes }}min lunch)
          </span>
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

      <!-- API Error -->
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
      <div class="flex justify-end space-x-3">
        <button
          v-if="existingEntry"
          @click="handleDelete"
          type="button"
          :disabled="loading"
          class="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Delete Entry
        </button>
        
        <button
          type="submit"
          :disabled="loading || validationErrors.length > 0"
          class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
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
import type { TimeEntryFormData } from '@/types'

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

// State
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showSuccess = ref(false)
const existingEntry = ref(todayEntry.value)

// Safety mechanism to prevent stuck loading states
let loadingTimeout: NodeJS.Timeout | null = null

// Watch loading state and set a timeout to reset it if it gets stuck
watch(loading, (isLoading) => {
  if (isLoading) {
    console.log('⏰ TimeEntryForm: Loading started, setting 10s timeout')
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
    }
    // Set a 10-second timeout to reset loading state if it gets stuck
    loadingTimeout = setTimeout(() => {
      console.log('⚠️ TimeEntryForm: Loading timeout reached, this might indicate a stuck state')
      // Note: We don't force reset the loading state here as it's managed by the composable
      // But we log it for debugging
    }, 10000)
  } else {
    console.log('✅ TimeEntryForm: Loading completed')
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
  end_time: '17:00'
})

// Computed
const today = computed(() => new Date().toISOString().split('T')[0])

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
      end_time: user.value.default_end_time?.slice(0, 5) || '17:00'
    }
  }

  // If there's an existing entry for the selected date, use its values
  if (existingEntry.value) {
    formData.value = {
      start_time: existingEntry.value.start_time.slice(0, 5),
      lunch_break_minutes: existingEntry.value.lunch_break_minutes,
      end_time: existingEntry.value.end_time.slice(0, 5)
    }
  }
}

async function handleDateChange() {
  clearError()
  
  try {
    console.log('🔄 TimeEntryForm: Date changed to:', selectedDate.value)
    
    // Check if we already have entries loaded that include this date
    const existingEntryForDate = timeEntries.value.find(entry => entry.date === selectedDate.value)
    
    if (existingEntryForDate) {
      console.log('📝 TimeEntryForm: Found existing entry in cache:', existingEntryForDate)
      existingEntry.value = existingEntryForDate
      initializeFormData()
      return
    }
    
    // Only fetch if we don't have the entry in cache
    console.log('🔄 TimeEntryForm: Fetching entries for date:', selectedDate.value)
    const result = await fetchTimeEntries(selectedDate.value, selectedDate.value)
    
    console.log('📥 TimeEntryForm: Fetch result:', result)
    
    // Find entry for selected date after fetch
    const entry = timeEntries.value.find(entry => entry.date === selectedDate.value)
    existingEntry.value = entry || null
    
    console.log('📝 TimeEntryForm: Final existing entry:', existingEntry.value)
    
    initializeFormData()
  } catch (err) {
    console.error('❌ TimeEntryForm: Error in handleDateChange:', err)
  }
}

async function handleSubmit() {
  if (validationErrors.value.length > 0) return

  clearError()
  
  try {
    const entryData = {
      date: selectedDate.value,
      start_time: formData.value.start_time,
      end_time: formData.value.end_time,
      lunch_break_minutes: formData.value.lunch_break_minutes
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
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    console.error('Time entry error:', err)
  }
}

async function handleDelete() {
  if (!existingEntry.value) return

  if (!confirm('Are you sure you want to delete this time entry?')) return

  clearError()

  try {
    const result = await deleteTimeEntry(existingEntry.value.id)

    if (result.success) {
      existingEntry.value = null
      initializeFormData() // Reset to defaults
      showSuccess.value = true
      
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    console.error('Delete time entry error:', err)
  }
}

// Watchers
watch(selectedDate, () => {
  // Only trigger date change if it's not the initial mount
  if (selectedDate.value !== new Date().toISOString().split('T')[0]) {
    handleDateChange()
  }
})

watch(error, (newError) => {
  if (newError) {
    showSuccess.value = false
  }
})

// Lifecycle
onMounted(async () => {
  console.log('🚀 TimeEntryForm: Component mounted, fetching entries...')
  
  try {
    // Fetch entries for current month to have a good cache
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
    
    const result = await fetchTimeEntries(startOfMonth, endOfMonth)
    console.log('📥 TimeEntryForm: Mount fetch result:', result)
    
    // Find today's entry
    existingEntry.value = timeEntries.value.find(entry => entry.date === selectedDate.value) || null
    initializeFormData()
    
    console.log('✅ TimeEntryForm: Initialization complete')
  } catch (err) {
    console.error('❌ TimeEntryForm: Error during mount:', err)
    // Initialize with defaults even if fetch fails
    initializeFormData()
  }
})
</script>