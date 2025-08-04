import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuth } from './useAuth'
import type {
  UserSettings,
  UserSettingsFormData,
  DetailedApiResponse,
  User
} from '@/types'

// Helper function to compress images
function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (max 800px)
      const maxSize = 800
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export function useUserSettings() {
  const { user, updateProfile } = useAuth()

  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const uploading = ref(false)

  // Computed
  const currentSettings = computed((): UserSettings | null => {
    if (!user.value) return null

    return {
      default_start_time: user.value.default_start_time || '09:00',
      default_lunch_minutes: user.value.default_lunch_minutes || 60,
      default_end_time: user.value.default_end_time || '17:00',
      avatar_url: user.value.avatar_url
    }
  })

  // Methods
  async function updateSettings(settings: Partial<UserSettings>): Promise<DetailedApiResponse<User>> {
    if (!user.value) {
      return {
        data: null,
        error: { message: 'Not authenticated' },
        loading: false,
        success: false
      }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          default_start_time: settings.default_start_time,
          default_lunch_minutes: settings.default_lunch_minutes,
          default_end_time: settings.default_end_time,
          avatar_url: settings.avatar_url
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) {
        error.value = updateError.message
        return {
          data: null,
          error: {
            message: updateError.message,
            code: updateError.code
          },
          loading: false,
          success: false
        }
      }

      // Update the auth store with new profile data
      if (data) {
        await updateProfile({
          default_start_time: data.default_start_time,
          default_lunch_minutes: data.default_lunch_minutes,
          default_end_time: data.default_end_time,
          avatar_url: data.avatar_url
        })
      }

      return {
        data: data,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
      error.value = errorMessage

      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  async function uploadAvatar(file: File): Promise<DetailedApiResponse<string>> {
    if (!user.value) {
      return {
        data: null,
        error: { message: 'Not authenticated' },
        loading: false,
        success: false
      }
    }

    try {
      uploading.value = true
      error.value = null

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // More conservative file size limit (2MB instead of 5MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB')
      }

      // For now, skip compression to isolate the issue
      const fileToUpload = file

      // Generate unique filename
      const fileExt = fileToUpload.name.split('.').pop() || 'jpg'
      const fileName = `${user.value.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileToUpload)

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      if (!uploadData) {
        throw new Error('Upload failed: No data returned')
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL')
      }

      const avatarUrl = urlData.publicUrl

      // Update user profile with new avatar URL
      const updateResult = await updateSettings({ avatar_url: avatarUrl })

      if (!updateResult.success) {
        throw new Error(updateResult.error?.message || 'Failed to update profile')
      }

      return {
        data: avatarUrl,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
      error.value = errorMessage

      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      uploading.value = false
    }
  }

  async function removeAvatar(): Promise<DetailedApiResponse<boolean>> {
    if (!user.value?.avatar_url) {
      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    }

    try {
      loading.value = true
      error.value = null

      // Extract file path from URL
      const url = new URL(user.value.avatar_url)
      const filePath = url.pathname.split('/').slice(-2).join('/') // Get last two segments

      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) {
        // Continue anyway - we'll still remove the URL from the profile
      }

      // Update user profile to remove avatar URL
      const updateResult = await updateSettings({ avatar_url: undefined })

      return {
        data: updateResult.success,
        error: updateResult.error,
        loading: false,
        success: updateResult.success
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove avatar'
      error.value = errorMessage

      return {
        data: false,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  // Validation helpers
  function validateTimeSettings(settings: UserSettingsFormData): string[] {
    const errors: string[] = []

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (!settings.default_start_time || !timeRegex.test(settings.default_start_time)) {
      errors.push('Start time must be in HH:MM format')
    }

    if (!settings.default_end_time || !timeRegex.test(settings.default_end_time)) {
      errors.push('End time must be in HH:MM format')
    }

    // Validate lunch minutes
    if (settings.default_lunch_minutes < 0 || settings.default_lunch_minutes > 480) {
      errors.push('Lunch break must be between 0 and 480 minutes')
    }

    // Validate time range
    if (timeRegex.test(settings.default_start_time) && timeRegex.test(settings.default_end_time)) {
      const start = new Date(`2000-01-01T${settings.default_start_time}:00`)
      const end = new Date(`2000-01-01T${settings.default_end_time}:00`)

      if (start >= end) {
        errors.push('End time must be after start time')
      }
    }

    return errors
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    uploading: computed(() => uploading.value),
    currentSettings,

    // Methods
    updateSettings,
    uploadAvatar,
    removeAvatar,
    clearError,
    validateTimeSettings
  }
}