<template>
  <div class="flex items-center space-x-6">
    <!-- Current Avatar Display -->
    <div class="relative">
      <div class="border-4 border-white shadow-lg">
        <SecureAvatar 
          :avatar-path="user?.avatar_url"
          :name="user?.full_name || ''"
          size="xl"
          :alt="user?.full_name || 'User avatar'"
        />
      </div>
      
      <!-- Upload Progress Overlay -->
      <div
        v-if="uploading"
        class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
      >
        <svg class="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Upload Controls -->
    <div class="flex-1">
      <div class="space-y-3">
        <!-- Upload Button -->
        <div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <button
            @click="triggerFileSelect"
            :disabled="uploading"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {{ uploading ? 'Uploading...' : 'Upload new photo' }}
          </button>
        </div>

        <!-- Remove Button -->
        <div v-if="currentAvatarUrl">
          <button
            @click="handleRemoveAvatar"
            :disabled="uploading || loading"
            class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove photo
          </button>
        </div>

        <!-- Upload Guidelines -->
        <div class="text-sm text-gray-500">
          <p>JPG, PNG or GIF. Max size 5MB.</p>
          <p>Recommended: Square image, at least 200x200px.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Error Message -->
  <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
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

  <!-- Success Message -->
  <div v-if="showSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-green-800">Avatar updated successfully!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUserSettings } from '@/composables/useUserSettings'
import SecureAvatar from './SecureAvatar.vue'

// Composables
const { user } = useAuth()
const { uploadAvatar, removeAvatar, uploading, loading, error, clearError } = useUserSettings()

// Refs
const fileInput = ref<HTMLInputElement>()
const showSuccess = ref(false)

// Computed
const currentAvatarUrl = computed(() => user.value?.avatar_url)

// Methods

function triggerFileSelect() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  clearError()
  
  try {
    const result = await uploadAvatar(file)
    
    if (result.success) {
      showSuccess.value = true
      // Clear the file input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    // Handle error silently
  }
}

async function handleRemoveAvatar() {
  clearError()
  
  try {
    const result = await removeAvatar()
    
    if (result.success) {
      showSuccess.value = true
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    // Handle error silently
  }
}

// Watch for error changes to auto-hide success message
watch(error, (newError) => {
  if (newError) {
    showSuccess.value = false
  }
})
</script>