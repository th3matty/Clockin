<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Choose Your Avatar</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Avatar Grid -->
      <div 
        ref="scrollContainer"
        class="flex-1 overflow-y-auto p-6"
        @scroll="handleScroll"
      >
        <div class="grid grid-cols-4 sm:grid-cols-6 gap-4">
          <div
            v-for="avatar in avatars"
            :key="avatar.id"
            @click="selectAvatar(avatar)"
            :class="[
              'relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105',
              selectedAvatar?.id === avatar.id 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
            ]"
          >
            <div class="aspect-square p-2">
              <div class="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <!-- Use the real Beanhead component from beanheads-vue -->
                <Beanhead
                  v-bind="avatar.config"
                  width="80"
                />
              </div>
            </div>
            
            <!-- Selection Indicator -->
            <div
              v-if="selectedAvatar?.id === avatar.id"
              class="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <!-- Load More Hint -->
        <div v-if="!loading && avatars.length > 0" class="text-center py-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Scroll down to load more avatars
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <button
          @click="generateMore"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate More
        </button>

        <div class="flex space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmSelection"
            :disabled="!selectedAvatar || saving"
            class="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ saving ? 'Saving...' : 'Use This Avatar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Beanhead } from 'beanheads-vue'
import { useAvatarGenerator, type GeneratedAvatar } from '@/composables/useAvatarGenerator'

// Emits
const emit = defineEmits<{
  close: []
  select: [avatar: GeneratedAvatar]
}>()

// Composables
const { generateAvatars, saveGeneratedAvatar } = useAvatarGenerator()

// State
const avatars = ref<GeneratedAvatar[]>([])
const selectedAvatar = ref<GeneratedAvatar | null>(null)
const loading = ref(false)
const saving = ref(false)
const scrollContainer = ref<HTMLElement>()

// Methods
async function loadInitialAvatars() {
  loading.value = true
  try {
    const newAvatars = await generateAvatars(24) // Load 24 initial avatars
    avatars.value = newAvatars
  } catch (error) {
    console.error('Failed to generate avatars:', error)
  } finally {
    loading.value = false
  }
}

async function generateMore() {
  if (loading.value) return
  
  loading.value = true
  try {
    const newAvatars = await generateAvatars(12) // Load 12 more avatars
    avatars.value.push(...newAvatars)
  } catch (error) {
    console.error('Failed to generate more avatars:', error)
  } finally {
    loading.value = false
  }
}

function selectAvatar(avatar: GeneratedAvatar) {
  selectedAvatar.value = avatar
}

async function confirmSelection() {
  if (!selectedAvatar.value) return

  saving.value = true
  try {
    await saveGeneratedAvatar(selectedAvatar.value)
    emit('select', selectedAvatar.value)
    emit('close')
  } catch (error) {
    console.error('Failed to save avatar:', error)
  } finally {
    saving.value = false
  }
}

async function handleScroll() {
  if (!scrollContainer.value || loading.value) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  
  // Load more when user scrolls to bottom (with 100px buffer)
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    await generateMore()
  }
}

// Lifecycle
onMounted(async () => {
  await loadInitialAvatars()
})
</script>