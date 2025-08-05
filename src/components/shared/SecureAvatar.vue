<template>
  <div 
    :class="[
      'rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden',
      sizeClasses
    ]"
  >
    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse bg-gray-200 dark:bg-gray-600 w-full h-full"></div>
    
    <!-- BeanHead Avatar -->
    <div v-else-if="beanHeadConfig" class="w-full h-full flex items-center justify-center">
      <Beanhead
        v-bind="beanHeadConfig"
        :width="beanHeadSize"
      />
    </div>
    
    <!-- Regular Avatar Image -->
    <img
      v-else-if="signedUrl"
      :src="signedUrl"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
    
    <!-- Fallback Initials -->
    <div
      v-else
      :class="[
        'w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center',
        textSizeClasses
      ]"
    >
      <span class="font-semibold text-primary-700 dark:text-primary-300">
        {{ initials }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Beanhead } from 'beanheads-vue'
import { useSecureAvatars } from '@/composables/useSecureAvatars'
import type { BeanHeadConfig } from '@/composables/useAvatarGenerator'

interface Props {
  avatarPath?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  avatarPath: null,
  name: '',
  size: 'md',
  alt: 'User avatar'
})

// Composables
const { getAvatarUrl, loading } = useSecureAvatars()

// State
const signedUrl = ref<string | null>(null)
const imageError = ref(false)

// Computed
const initials = computed(() => {
  if (!props.name) return '?'
  
  return props.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const beanHeadConfig = computed((): BeanHeadConfig | null => {
  if (!props.avatarPath) return null
  
  try {
    // Check if the avatarPath is a JSON string (BeanHead config)
    const parsed = JSON.parse(props.avatarPath)
    
    // Validate that it looks like a BeanHead config
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as BeanHeadConfig
    }
  } catch {
    // Not JSON, probably a regular image URL
  }
  
  return null
})

const beanHeadSize = computed(() => {
  switch (props.size) {
    case 'xs': return 24
    case 'sm': return 32
    case 'md': return 48
    case 'lg': return 64
    case 'xl': return 96
    default: return 48
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-6 h-6'
    case 'sm': return 'w-8 h-8'
    case 'md': return 'w-12 h-12'
    case 'lg': return 'w-16 h-16'
    case 'xl': return 'w-24 h-24'
    default: return 'w-12 h-12'
  }
})

const textSizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-xs'
    case 'sm': return 'text-sm'
    case 'md': return 'text-base'
    case 'lg': return 'text-lg'
    case 'xl': return 'text-2xl'
    default: return 'text-base'
  }
})

// Methods
async function loadAvatar() {
  // If it's a BeanHead config, don't try to load as image
  if (beanHeadConfig.value) {
    signedUrl.value = null
    return
  }
  
  if (!props.avatarPath || imageError.value) {
    signedUrl.value = null
    return
  }

  try {
    const url = await getAvatarUrl(props.avatarPath)
    signedUrl.value = url
  } catch (err) {
    console.error('Failed to load avatar:', err)
    signedUrl.value = null
  }
}

function handleImageError() {
  imageError.value = true
  signedUrl.value = null
}

// Watchers
watch(() => props.avatarPath, () => {
  imageError.value = false
  loadAvatar()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadAvatar()
})
</script>