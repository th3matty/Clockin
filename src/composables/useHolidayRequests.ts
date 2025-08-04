import { storeToRefs } from 'pinia'
import { useHolidayRequestsStore } from '@/stores/holidayRequests'

export function useHolidayRequests() {
  const store = useHolidayRequestsStore()
  
  // Use storeToRefs to maintain reactivity for state/getters
  const {
    loading,
    error,
    holidayRequests,
    pendingRequests,
    approvedRequests,
    deniedRequests,
    usedHolidayDays,
    remainingHolidayDays
  } = storeToRefs(store)
  
  // Actions don't need storeToRefs
  const {
    fetchHolidayRequests,
    createHolidayRequest,
    cancelHolidayRequest,
    calculateBusinessDays,
    validateHolidayRequest,
    getHolidayStatusForDate,
    clearError
  } = store
  
  return {
    // Reactive state/getters
    loading,
    error,
    holidayRequests,
    pendingRequests,
    approvedRequests,
    deniedRequests,
    usedHolidayDays,
    remainingHolidayDays,
    
    // Actions
    fetchHolidayRequests,
    createHolidayRequest,
    cancelHolidayRequest,
    calculateBusinessDays,
    validateHolidayRequest,
    getHolidayStatusForDate,
    clearError
  }
}