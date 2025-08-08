<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Manage Holiday Allowance</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="px-6 py-4">
        <!-- User Info -->
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

        <!-- Current Allowance -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Current Allowance</span>
            <span class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ user.holiday_allowance || 25 }} days</span>
          </div>
        </div>

        <!-- Update Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="allowance" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Holiday Allowance
            </label>
            <input
              id="allowance"
              v-model.number="formData.allowance"
              type="number"
              min="0"
              max="50"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter holiday allowance"
              :disabled="loading"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Typical range: 20-30 days per year
            </p>
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
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
              <span v-else>Update Allowance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserDetail } from '@/composables/useUserDetail'
import SecureAvatar from '@/components/shared/SecureAvatar.vue'
import type { User } from '@/types'

// Props
interface Props {
  user: User
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  updated: []
}>()

// Composables
const { updateHolidayAllowance } = useUserDetail()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const formData = ref({
  allowance: 25
})

// Computed
const isFormValid = computed(() => {
  return formData.value.allowance >= 0 && formData.value.allowance <= 50
})

// Methods
async function handleSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    const result = await updateHolidayAllowance(props.user.id, formData.value.allowance)

    if (result.success) {
      emit('updated')
      emit('close')
    } else {
      error.value = result.error || 'Failed to update holiday allowance'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  formData.value.allowance = props.user.holiday_allowance || 25
})
</script>