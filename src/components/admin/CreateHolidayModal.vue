<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Create Holiday for Employee</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="px-6 py-4">
        <!-- Employee Info -->
        <div class="flex items-center space-x-4 mb-6">
          <SecureAvatar 
            :avatar-path="user.avatar_url"
            :name="user.full_name"
            size="md"
            :alt="user.full_name"
          />
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ user.full_name }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</p>
          </div>
        </div>

        <!-- Holiday Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Start Date -->
          <div>
            <label for="start-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              id="start-date"
              v-model="formData.start_date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              :disabled="loading"
            />
          </div>

          <!-- End Date -->
          <div>
            <label for="end-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              id="end-date"
              v-model="formData.end_date"
              type="date"
              required
              :min="formData.start_date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              :disabled="loading"
            />
          </div>

          <!-- Reason -->
          <div>
            <label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              v-model="formData.reason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter reason for holiday..."
              :disabled="loading"
            ></textarea>
          </div>

          <!-- Days Calculation -->
          <div v-if="calculatedDays > 0" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm text-blue-800 dark:text-blue-200">
                This holiday request is for <strong>{{ calculatedDays }}</strong> {{ calculatedDays === 1 ? 'day' : 'days' }}
              </span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button" 
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              :disabled="loading"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
              <span v-else>Create Holiday</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { differenceInDays, parseISO } from 'date-fns'
import SecureAvatar from '@/components/shared/SecureAvatar.vue'
import { supabase } from '@/utils/supabase'
import type { User } from '@/types'

// Props
interface Props {
  user: User
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  success: []
}>()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const formData = ref({
  start_date: '',
  end_date: '',
  reason: ''
})

// Computed
const calculatedDays = computed(() => {
  if (!formData.value.start_date || !formData.value.end_date) return 0
  
  const startDate = parseISO(formData.value.start_date)
  const endDate = parseISO(formData.value.end_date)
  
  if (endDate < startDate) return 0
  
  return differenceInDays(endDate, startDate) + 1
})

const isFormValid = computed(() => {
  return formData.value.start_date && 
         formData.value.end_date && 
         formData.value.start_date <= formData.value.end_date &&
         calculatedDays.value > 0
})

// Methods
async function handleSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    // Create the holiday request as approved (admin-created)
    const { error: insertError } = await supabase
      .from('holiday_requests')
      .insert({
        user_id: props.user.id,
        start_date: formData.value.start_date,
        end_date: formData.value.end_date,
        days_requested: calculatedDays.value,
        reason: formData.value.reason || 'Admin-created holiday',
        status: 'approved',
        admin_notes: 'Created by administrator'
      })

    if (insertError) throw insertError

    // Create notification for the employee
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: props.user.id,
        type: 'holiday_approved',
        title: 'Holiday Approved',
        message: `Your holiday from ${formatDate(formData.value.start_date)} to ${formatDate(formData.value.end_date)} has been approved by your administrator.`,
        read: false
      })

    if (notificationError) {
      console.warn('Failed to create notification:', notificationError)
      // Don't throw error for notification failure
    }

    emit('success')
    emit('close')
  } catch (err: any) {
    error.value = err.message || 'Failed to create holiday request'
    console.error('Error creating holiday:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Set default start date to today
  const today = new Date()
  formData.value.start_date = today.toISOString().split('T')[0]
  formData.value.end_date = today.toISOString().split('T')[0]
})
</script>