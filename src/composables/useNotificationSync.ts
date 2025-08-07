import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

// Global notification sync state
const lastSyncTime = ref<number>(0)
const syncInProgress = ref(false)

export function useNotificationSync() {
  const { user } = useAuth()
  const { fetchNotifications, loading } = useNotifications()

  /**
   * Sync notifications with debouncing to prevent excessive API calls
   */
  async function syncNotifications(reason = 'manual') {
    // Prevent multiple simultaneous syncs
    if (syncInProgress.value || loading.value || !user.value) {
      return
    }

    // Debounce: Don't sync if we synced less than 2 seconds ago
    const now = Date.now()
    if (now - lastSyncTime.value < 2000) {
      return
    }

    try {
      syncInProgress.value = true
      lastSyncTime.value = now
      
      await fetchNotifications(user.value.id)
    } catch (error) {
      console.error('Failed to sync notifications:', error)
    } finally {
      syncInProgress.value = false
    }
  }

  /**
   * Force sync notifications without debouncing (use sparingly)
   */
  async function forceSyncNotifications(reason = 'force') {
    if (!user.value || loading.value) {
      return
    }

    try {
      syncInProgress.value = true
      lastSyncTime.value = Date.now()
      
      await fetchNotifications(user.value.id)
    } catch (error) {
      console.error('Failed to force sync notifications:', error)
    } finally {
      syncInProgress.value = false
    }
  }

  return {
    syncNotifications,
    forceSyncNotifications,
    syncInProgress: readonly(syncInProgress),
    lastSyncTime: readonly(lastSyncTime)
  }
}

// Helper function to get readonly refs
function readonly<T>(ref: any) {
  return computed(() => ref.value)}