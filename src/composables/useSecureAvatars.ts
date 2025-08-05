import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'

// Cache for signed URLs to avoid regenerating them frequently
const urlCache = new Map<string, { url: string; expires: number }>()

export function useSecureAvatars() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Generate a signed URL for an avatar file path
   * Uses caching to avoid frequent regeneration
   */
  async function getAvatarUrl(avatarPath: string | null | undefined): Promise<string | null> {
    if (!avatarPath) return null

    try {
      // Check cache first
      const cached = urlCache.get(avatarPath)
      const now = Date.now()
      
      // If cached URL exists and hasn't expired (with 1 hour buffer), use it
      if (cached && cached.expires > now + (60 * 60 * 1000)) {
        return cached.url
      }

      loading.value = true
      error.value = null

      // Generate new signed URL (24 hour expiration)
      const { data, error: signedUrlError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 60 * 60 * 24) // 24 hours

      if (signedUrlError || !data?.signedUrl) {
        error.value = 'Failed to load avatar'
        return null
      }

      // Cache the URL with expiration time
      urlCache.set(avatarPath, {
        url: data.signedUrl,
        expires: now + (23 * 60 * 60 * 1000) // Cache for 23 hours
      })

      return data.signedUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load avatar'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear the URL cache (useful for cleanup or when user logs out)
   */
  function clearCache() {
    urlCache.clear()
  }

  /**
   * Remove a specific URL from cache (useful when avatar is updated)
   */
  function removeCachedUrl(avatarPath: string) {
    urlCache.delete(avatarPath)
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getAvatarUrl,
    clearCache,
    removeCachedUrl
  }
}