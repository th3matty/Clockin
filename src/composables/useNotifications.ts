import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'
import type { NotificationType } from '@/types'

export function useNotifications() {
  const store = useNotificationsStore()
  
  // Use storeToRefs to maintain reactivity for state/getters
  const { 
    notifications, 
    loading, 
    error, 
    unreadNotifications, 
    unreadCount, 
    sortedNotifications 
  } = storeToRefs(store)
  
  // Actions don't need storeToRefs
  const { 
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setupRealtimeSubscription,
    clearRealtimeSubscription,
    clearError,
    clearNotifications
  } = store

  // Utility functions
  function getNotificationColor(type: NotificationType): string {
    switch (type) {
      case 'holiday_approved':
        return 'bg-green-500'
      case 'holiday_denied':
        return 'bg-red-500'
      case 'holiday_request':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  function getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'holiday_request':
        return 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
      case 'holiday_approved':
        return 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
      case 'holiday_denied':
        return 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  }

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  // Helper functions for creating specific notification types
  async function createHolidayRequestNotification(
    adminUserId: string,
    employeeName: string,
    startDate: string,
    endDate: string,
    daysRequested: number
  ) {
    const title = 'New Holiday Request'
    const message = `${employeeName} has requested ${daysRequested} day${daysRequested > 1 ? 's' : ''} of holiday (${startDate} - ${endDate}).`
    
    return await createNotification(adminUserId, 'holiday_request', title, message)
  }

  async function createHolidayApprovedNotification(
    employeeUserId: string,
    startDate: string,
    endDate: string
  ) {
    const title = 'Holiday Request Approved'
    const message = `Your holiday request for ${startDate} - ${endDate} has been approved.`
    
    return await createNotification(employeeUserId, 'holiday_approved', title, message)
  }

  async function createHolidayDeniedNotification(
    employeeUserId: string,
    startDate: string,
    endDate: string,
    reason?: string
  ) {
    const title = 'Holiday Request Denied'
    const message = `Your holiday request for ${startDate} - ${endDate} has been denied.${reason ? ` Reason: ${reason}` : ''}`
    
    return await createNotification(employeeUserId, 'holiday_denied', title, message)
  }

  return {
    // Reactive state/getters
    notifications,
    loading,
    error,
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
    
    // Utility functions
    getNotificationColor,
    getNotificationIcon,
    formatTime,
    
    // Helper functions for specific notification types
    createHolidayRequestNotification,
    createHolidayApprovedNotification,
    createHolidayDeniedNotification
  }
}