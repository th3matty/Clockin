import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase } from '@/utils/supabase'
import type { Notification, NotificationType, DetailedApiResponse } from '@/types'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const realtimeSubscription = ref<any>(null)

  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  )
  
  const unreadCount = computed(() => unreadNotifications.value.length)
  
  const sortedNotifications = computed(() => 
    [...notifications.value].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  )

  // Actions
  async function fetchNotifications(userId: string): Promise<DetailedApiResponse<Notification[]>> {
    // Prevent multiple concurrent fetches
    if (loading.value) {
      return {
        data: notifications.value,
        error: null,
        loading: true,
        success: false
      }
    }

    try {
      loading.value = true
      error.value = null

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
      })

      const fetchPromise = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const { data, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (fetchError) {
        error.value = fetchError.message
        return {
          data: null,
          error: {
            message: fetchError.message,
            code: fetchError.code
          },
          loading: false,
          success: false
        }
      }

      notifications.value = data || []

      return {
        data: data || [],
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications'
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

  async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string
  ): Promise<DetailedApiResponse<Notification>> {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          read: false
        })
        .select()
        .single()

      if (createError) {
        error.value = createError.message
        return {
          data: null,
          error: {
            message: createError.message,
            code: createError.code
          },
          loading: false,
          success: false
        }
      }

      // Add to local state
      if (data) {
        notifications.value.unshift(data)
      }

      return {
        data: data,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification'
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

  async function markAsRead(notificationId: string): Promise<DetailedApiResponse<boolean>> {
    try {
      error.value = null

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (updateError) {
        error.value = updateError.message
        return {
          data: false,
          error: {
            message: updateError.message,
            code: updateError.code
          },
          loading: false,
          success: false
        }
      }

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }

      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read'
      error.value = errorMessage
      
      return {
        data: false,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    }
  }

  async function markAllAsRead(userId: string): Promise<DetailedApiResponse<boolean>> {
    try {
      loading.value = true
      error.value = null

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (updateError) {
        error.value = updateError.message
        return {
          data: false,
          error: {
            message: updateError.message,
            code: updateError.code
          },
          loading: false,
          success: false
        }
      }

      // Update local state
      notifications.value.forEach(notification => {
        if (!notification.read) {
          notification.read = true
        }
      })

      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read'
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

  async function deleteNotification(notificationId: string): Promise<DetailedApiResponse<boolean>> {
    try {
      error.value = null

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (deleteError) {
        error.value = deleteError.message
        return {
          data: false,
          error: {
            message: deleteError.message,
            code: deleteError.code
          },
          loading: false,
          success: false
        }
      }

      // Remove from local state
      notifications.value = notifications.value.filter(n => n.id !== notificationId)

      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification'
      error.value = errorMessage
      
      return {
        data: false,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    }
  }

  function setupRealtimeSubscription(userId: string) {
    if (realtimeSubscription.value) {
      realtimeSubscription.value.unsubscribe()
    }

    realtimeSubscription.value = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          notifications.value.unshift(newNotification)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          const index = notifications.value.findIndex(n => n.id === updatedNotification.id)
          if (index !== -1) {
            notifications.value[index] = updatedNotification
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const deletedNotification = payload.old as Notification
          notifications.value = notifications.value.filter(n => n.id !== deletedNotification.id)
        }
      )
      .subscribe()
  }

  function clearRealtimeSubscription() {
    if (realtimeSubscription.value) {
      realtimeSubscription.value.unsubscribe()
      realtimeSubscription.value = null
    }
  }

  function clearError() {
    error.value = null
  }

  function clearNotifications() {
    notifications.value = []
  }

  function resetLoadingState() {
    loading.value = false
    error.value = null
  }

  return {
    // State (readonly for external access)
    notifications: readonly(notifications),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    unreadNotifications,
    unreadCount,
    sortedNotifications,
    
    // Actions
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setupRealtimeSubscription,
    clearRealtimeSubscription,
    clearError,
    clearNotifications,
    resetLoadingState
  }
})