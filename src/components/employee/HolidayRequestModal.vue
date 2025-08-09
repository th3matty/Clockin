<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Request Holiday</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-6">
        <!-- Holiday Allowance Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              <p class="font-medium text-blue-900">
                {{ remainingHolidayDays }} holiday days remaining
              </p>
              <p class="text-blue-700">
                {{ usedHolidayDays }} of {{ totalHolidayDays }} days used this year
              </p>
            </div>
          </div>
        </div>

        <!-- Start Date -->
        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input id="start_date" v-model="formData.start_date" type="date" required :min="minDate" :class="[
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            displayedValidationErrors.some(e => e.includes('Start date')) ? 'border-red-300' : 'border-gray-300'
          ]" :disabled="loading" @blur="touched.start_date = true" @change="touched.start_date = true" />
        </div>

        <!-- End Date -->
        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input id="end_date" v-model="formData.end_date" type="date" required :min="formData.start_date || minDate"
            :class="[
              'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              displayedValidationErrors.some(e => e.includes('End date')) ? 'border-red-300' : 'border-gray-300'
            ]" :disabled="loading" @blur="touched.end_date = true" @change="touched.end_date = true" />
        </div>

        <!-- Days Calculation -->
        <div v-if="formData.start_date && formData.end_date" class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Business days requested:</span>
            <span class="text-lg font-semibold text-primary-600">
              {{ calculatedDays }} {{ calculatedDays === 1 ? 'day' : 'days' }}
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Weekends are not counted as holiday days
          </div>
        </div>

        <!-- Reason -->
        <div>
          <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <textarea id="reason" v-model="formData.reason" rows="3" maxlength="500" :class="[
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none',
            displayedValidationErrors.some(e => e.includes('Reason')) ? 'border-red-300' : 'border-gray-300'
          ]" placeholder="Optional reason for your holiday request..." :disabled="loading"
            @blur="touched.reason = true"></textarea>
          <div class="flex justify-between mt-1">
            <p class="text-xs text-gray-500">
              Providing a reason can help with approval
            </p>
            <p class="text-xs text-gray-500">
              {{ formData.reason.length }}/500
            </p>
          </div>
        </div>

        <!-- Validation Errors -->
        <div v-if="displayedValidationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-4">
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
                <li v-for="error in displayedValidationErrors" :key="error">{{ error }}</li>
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

        <!-- Modal Footer -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            :disabled="loading">
            Cancel
          </button>
          <button type="submit" :disabled="loading || !isFormValid"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ loading ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useHolidayRequests } from '@/composables/useHolidayRequests'
import { useToast } from '@/composables/useToast'
import type { HolidayRequestFormData } from '@/types'

// Emits
const emit = defineEmits<{
  close: []
  success: []
}>()

// Composables
const { user } = useAuth()
const {
  loading,
  error,
  remainingHolidayDays,
  usedHolidayDays,
  createHolidayRequest,
  calculateBusinessDays,
  validateHolidayRequest,
  clearError
} = useHolidayRequests()
const { success } = useToast()

// State
const formData = ref({
  start_date: '',
  end_date: '',
  reason: ''
})

const touched = ref({
  start_date: false,
  end_date: false,
  reason: false
})

// Computed
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const totalHolidayDays = computed(() => user.value?.holiday_allowance || 25)

const calculatedDays = computed(() => {
  if (!formData.value.start_date || !formData.value.end_date) return 0

  return calculateBusinessDays(
    formData.value.start_date,
    formData.value.end_date
  )
})

const validationErrors = computed(() => {
  // Convert string dates to Date objects for validation
  const validationData = {
    start_date: formData.value.start_date ? new Date(formData.value.start_date) : null,
    end_date: formData.value.end_date ? new Date(formData.value.end_date) : null,
    reason: formData.value.reason
  }
  return validateHolidayRequest(validationData)
})

const displayedValidationErrors = computed(() => {
  // Only show validation errors for fields that have been touched
  return validationErrors.value.filter(error => {
    if (error.includes('Start date') && !touched.value.start_date) return false
    if (error.includes('End date') && !touched.value.end_date) return false
    if (error.includes('Reason') && !touched.value.reason) return false
    return true
  })
})

const isFormValid = computed(() => {
  return formData.value.start_date && formData.value.end_date && validationErrors.value.length === 0
})

// Methods
async function handleSubmit() {
  // Mark all fields as touched on submit attempt
  touched.value.start_date = true
  touched.value.end_date = true
  touched.value.reason = true

  if (!isFormValid.value) {
    return
  }

  clearError()

  try {
    const requestData = {
      start_date: formData.value.start_date,
      end_date: formData.value.end_date,
      reason: formData.value.reason.trim() || undefined
    }

    const result = await createHolidayRequest(requestData)

    if (result.success) {
      // Show success toast
      success(
        'Holiday Request Submitted',
        `Your ${calculatedDays.value} day${calculatedDays.value > 1 ? 's' : ''} holiday request has been submitted for approval.`
      )

      // Reset form
      formData.value = {
        start_date: '',
        end_date: '',
        reason: ''
      }

      // Reset touched state
      touched.value = {
        start_date: false,
        end_date: false,
        reason: false
      }

      emit('success')
      emit('close')
    }
  } catch (err) {
    // Handle error silently
  }
}

// Watchers
watch(() => formData.value.start_date, (newStartDate) => {
  // If end date is before start date, reset it
  if (newStartDate && formData.value.end_date && formData.value.end_date < newStartDate) {
    formData.value.end_date = ''
  }
})
</script>