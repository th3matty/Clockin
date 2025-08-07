import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { getYear, parseISO, isWithinInterval } from 'date-fns'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/composables/useAuth'
import type {
  HolidayRequest,
  HolidayRequestInput,
  HolidayRequestFormData,
  DetailedApiResponse
} from '@/types'

export const useHolidayRequestsStore = defineStore('holidayRequests', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const holidayRequests = ref<HolidayRequest[]>([])

  console.log('🏪 Store: Holiday requests store initialized')

  // Get user reactively
  const { user } = useAuth()

  // Computed
  const pendingRequests = computed(() =>
    holidayRequests.value.filter(request => request.status === 'pending')
  )

  const approvedRequests = computed(() =>
    holidayRequests.value.filter(request => request.status === 'approved')
  )

  const deniedRequests = computed(() =>
    holidayRequests.value.filter(request => request.status === 'denied')
  )

  const usedHolidayDays = computed(() => {
    const currentYear = new Date().getFullYear()
    const approved = approvedRequests.value
    const currentYearApproved = approved.filter(request => {
      const requestYear = getYear(parseISO(request.start_date))
      return requestYear === currentYear
    })
    const totalUsed = currentYearApproved.reduce((total, request) => total + request.days_requested, 0)

    console.log('🔍 Store: usedHolidayDays calculation:', {
      currentYear,
      totalRequests: holidayRequests.value.length,
      approvedRequests: approved.length,
      currentYearApproved: currentYearApproved.length,
      totalUsed
    })

    return totalUsed
  })

  const remainingHolidayDays = computed(() => {
    const totalAllowance = user.value?.holiday_allowance || 25
    const used = usedHolidayDays.value
    const remaining = Math.max(0, totalAllowance - used)

    console.log('🔍 Store: remainingHolidayDays calculation:', {
      totalAllowance,
      used,
      remaining
    })

    return remaining
  })

  // Actions
  async function fetchHolidayRequests(year?: number): Promise<DetailedApiResponse<HolidayRequest[]>> {
    console.log('🔍 Store: fetchHolidayRequests called with year:', year)
    console.log('👤 Store: Current user:', user.value)

    if (!user.value) {
      console.log('❌ Store: No user authenticated')
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

      console.log('🔧 Store: Building query for user_id:', user.value.id)

      let query = supabase
        .from('holiday_requests')
        .select('*')
        .eq('user_id', user.value.id)
        .order('start_date', { ascending: false })

      console.log('📋 Store: Query built, about to execute...')

      if (year) {
        console.log('📅 Store: Adding year filter for:', year)
        const startOfYear = `${year}-01-01`
        const endOfYear = `${year}-12-31`
        query = query.gte('start_date', startOfYear).lte('start_date', endOfYear)
      }

      console.log('⚡ Store: Executing database query...')
      const { data, error: fetchError } = await query
      console.log('⚡ Store: Query completed!')

      console.log('🗃️ Store: Database query result:', { data, fetchError })

      if (fetchError) {
        console.error('❌ Store: Fetch error:', fetchError)
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

      console.log('✅ Store: Setting holidayRequests to:', data)
      holidayRequests.value = data || []
      console.log('📊 Store: holidayRequests.value is now:', holidayRequests.value)

      return {
        data: data || [],
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch holiday requests'
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

  async function createHolidayRequest(requestData: HolidayRequestInput): Promise<DetailedApiResponse<HolidayRequest>> {
    if (!user.value) {
      console.log('❌ Not authenticated')
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

      console.log('🔄 Starting holiday request creation...')
      console.log('📅 Request data:', requestData)
      console.log('👤 User ID:', user.value.id)

      // Calculate business days
      console.log('🧮 Calculating business days...')
      const daysRequested = calculateBusinessDays(requestData.start_date, requestData.end_date)
      console.log('📊 Days requested:', daysRequested)

      const insertData = {
        user_id: user.value.id,
        start_date: requestData.start_date,
        end_date: requestData.end_date,
        days_requested: daysRequested,
        reason: requestData.reason || null,
        status: 'pending'
      }

      console.log('💾 Inserting data:', insertData)

      const { data, error: createError } = await supabase
        .from('holiday_requests')
        .insert(insertData)
        .select()
        .single()

      console.log('📤 Database response:', { data, createError })

      if (createError) {
        console.error('Create holiday request error:', createError)
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

      console.log('✅ Holiday request created successfully:', data)

      // Add to local state
      if (data) {
        holidayRequests.value.unshift(data)
        console.log('📝 Added to local state. Total requests:', holidayRequests.value.length)
      }

      return {
        data: data,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create holiday request'
      console.error('❌ Create holiday request error:', err)
      error.value = errorMessage

      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      console.log('🏁 Finally block - setting loading to false')
      loading.value = false
    }
  }

  async function cancelHolidayRequest(requestId: string): Promise<DetailedApiResponse<boolean>> {
    console.log('🗑️ Store: cancelHolidayRequest called for:', requestId)

    if (!user.value) {
      console.log('❌ Store: Not authenticated')
      return {
        data: false,
        error: { message: 'Not authenticated' },
        loading: false,
        success: false
      }
    }

    try {
      loading.value = true
      error.value = null

      // Only allow canceling pending requests
      const request = holidayRequests.value.find(r => r.id === requestId)
      if (!request || request.status !== 'pending') {
        throw new Error('Can only cancel pending requests')
      }

      const { error: deleteError } = await supabase
        .from('holiday_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.value.id) // Ensure user can only cancel their own requests

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

      // Clean up related admin notifications for this holiday request
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('reference_id', requestId)
        .eq('type', 'holiday_request')
        .eq('read', false) // Only delete unread notifications to avoid confusion

      if (notificationError) {
        console.warn('Failed to clean up related notifications:', notificationError)
        // Don't fail the whole operation if notification cleanup fails
      } else {
        console.log('✅ Successfully cleaned up related notifications for request:', requestId)
      }

      // Remove from local state
      console.log('🗑️ Store: Removing request from local state. Before:', holidayRequests.value.length)
      holidayRequests.value = holidayRequests.value.filter(r => r.id !== requestId)
      console.log('🗑️ Store: After removal:', holidayRequests.value.length)

      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel holiday request'
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

  function calculateBusinessDays(startDate: string, endDate: string): number {
    console.log('🧮 calculateBusinessDays called with:', { startDate, endDate })

    const start = parseISO(startDate)
    const end = parseISO(endDate)

    console.log('📅 Parsed dates:', { start, end })

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('❌ Invalid dates provided')
      return 0
    }

    let days = 0
    const current = new Date(start)

    while (current <= end) {
      const dayOfWeek = current.getDay()
      // Count weekdays only (Monday = 1, Friday = 5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }

    console.log('📊 Calculated business days:', days)
    return days
  }

  function validateHolidayRequest(data: HolidayRequestFormData): string[] {
    const errors: string[] = []

    if (!data.start_date) {
      errors.push('Start date is required')
    }

    if (!data.end_date) {
      errors.push('End date is required')
    }

    if (data.start_date && data.end_date) {
      const start = data.start_date instanceof Date ? data.start_date : parseISO(data.start_date)
      const end = data.end_date instanceof Date ? data.end_date : parseISO(data.end_date)

      if (start > end) {
        errors.push('End date must be on or after start date')
      }

      // Check if start date is in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start < today) {
        errors.push('Start date cannot be in the past')
      }

      // Calculate days and check against remaining allowance
      if (start <= end) {
        const startDateStr = data.start_date instanceof Date ? data.start_date.toISOString().split('T')[0] : data.start_date
        const endDateStr = data.end_date instanceof Date ? data.end_date.toISOString().split('T')[0] : data.end_date
        const daysRequested = calculateBusinessDays(startDateStr, endDateStr)

        if (daysRequested > remainingHolidayDays.value) {
          errors.push(`Not enough holiday days remaining. You have ${remainingHolidayDays.value} days left.`)
        }
      }
    }

    if (data.reason && data.reason.length > 500) {
      errors.push('Reason must be less than 500 characters')
    }

    return errors
  }

  function getHolidayStatusForDate(date: string): 'approved' | 'pending' | 'denied' | null {
    const targetDate = parseISO(date)

    for (const request of holidayRequests.value) {
      const startDate = parseISO(request.start_date)
      const endDate = parseISO(request.end_date)

      if (isWithinInterval(targetDate, { start: startDate, end: endDate })) {
        return request.status as 'approved' | 'pending' | 'denied'
      }
    }

    return null
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    holidayRequests: readonly(holidayRequests),

    // Getters
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
})