import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuth } from './useAuth'
import type { 
  TimeEntry, 
  TimeEntryInput, 
  TimeEntryFormData,
  DetailedApiResponse 
} from '@/types'

// Global state to prevent concurrent fetches across all instances
let globalFetchPromise: Promise<DetailedApiResponse<TimeEntry[]>> | null = null
let globalLoading = ref(false)
let globalTimeEntries = ref<TimeEntry[]>([])

// Safety mechanism to reset stuck loading states
let loadingResetTimeout: NodeJS.Timeout | null = null

function resetLoadingIfStuck() {
  if (loadingResetTimeout) {
    clearTimeout(loadingResetTimeout)
  }
  
  loadingResetTimeout = setTimeout(() => {
    if (globalLoading.value) {
      console.warn('⚠️ useTimeEntries: Loading state was stuck, resetting...')
      globalLoading.value = false
      globalFetchPromise = null
    }
  }, 15000) // 15 second safety timeout
}

function clearLoadingTimeout() {
  if (loadingResetTimeout) {
    clearTimeout(loadingResetTimeout)
    loadingResetTimeout = null
  }
}

export function useTimeEntries() {
  const { user } = useAuth()
  
  // State
  const loading = globalLoading
  const error = ref<string | null>(null)
  const timeEntries = globalTimeEntries
  const currentEntry = ref<TimeEntry | null>(null)

  // Computed
  const todayEntry = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return globalTimeEntries.value.find(entry => entry.date === today) || null
  })

  const weeklyHours = computed(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday

    const startDate = startOfWeek.toISOString().split('T')[0]
    const endDate = endOfWeek.toISOString().split('T')[0]

    return globalTimeEntries.value
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .reduce((total, entry) => total + entry.total_hours, 0)
  })

  const monthlyHours = computed(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const startDate = startOfMonth.toISOString().split('T')[0]
    const endDate = endOfMonth.toISOString().split('T')[0]

    return globalTimeEntries.value
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .reduce((total, entry) => total + entry.total_hours, 0)
  })

  // Methods
  async function fetchTimeEntries(startDate?: string, endDate?: string): Promise<DetailedApiResponse<TimeEntry[]>> {
    if (!user.value) {
      return {
        data: null,
        error: { message: 'Not authenticated' },
        loading: false,
        success: false
      }
    }

    // If there's already a fetch in progress, return that promise
    if (globalFetchPromise) {
      console.log('⏳ useTimeEntries: Fetch already in progress, returning existing promise')
      try {
        return await globalFetchPromise
      } catch (err) {
        // If the existing promise fails, clear it and allow a new fetch
        console.log('❌ useTimeEntries: Existing promise failed, clearing for retry')
        globalFetchPromise = null
        throw err
      }
    }

    // Create the fetch promise
    globalFetchPromise = performFetch(startDate, endDate)
    
    try {
      const result = await globalFetchPromise
      return result
    } catch (err) {
      // Clear the promise on error so subsequent calls can retry
      globalFetchPromise = null
      throw err
    } finally {
      // Clear the promise when done (success case)
      if (globalFetchPromise) {
        globalFetchPromise = null
      }
    }
  }

  async function performFetch(startDate?: string, endDate?: string): Promise<DetailedApiResponse<TimeEntry[]>> {
    try {
      console.log('🔄 useTimeEntries: Starting fetch, setting loading to true')
      globalLoading.value = true
      error.value = null
      
      // Start safety timeout
      resetLoadingIfStuck()

      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.value.id)
        .order('date', { ascending: false })

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      console.log('📡 useTimeEntries: Executing query...')
      
      const { data, error: fetchError } = await query
      console.log('📥 useTimeEntries: Query completed:', { data: data?.length, error: fetchError })

      if (fetchError) {
        console.error('❌ useTimeEntries: Fetch error:', fetchError)
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

      globalTimeEntries.value = data || []
      console.log('✅ useTimeEntries: Data updated, entries count:', globalTimeEntries.value.length)

      return {
        data: data || [],
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch time entries'
      console.error('❌ useTimeEntries: Exception in fetchTimeEntries:', err)
      error.value = errorMessage
      
      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    } finally {
      console.log('🏁 useTimeEntries: Finally block - setting loading to false')
      globalLoading.value = false
      clearLoadingTimeout()
    }
  }

  async function createTimeEntry(entryData: TimeEntryInput): Promise<DetailedApiResponse<TimeEntry>> {
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

      console.log('Creating time entry:', entryData)

      const { data, error: createError } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.value.id,
          date: entryData.date,
          start_time: entryData.start_time,
          end_time: entryData.end_time,
          lunch_break_minutes: entryData.lunch_break_minutes
        })
        .select()
        .single()

      if (createError) {
        console.error('Create error:', createError)
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

      console.log('Time entry created:', data)

      // Add to global state
      if (data) {
        globalTimeEntries.value.unshift(data)
        currentEntry.value = data
      }

      return {
        data: data,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create time entry'
      console.error('Create time entry error:', err)
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

  async function updateTimeEntry(entryId: string, entryData: Partial<TimeEntryInput>): Promise<DetailedApiResponse<TimeEntry>> {
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

      console.log('Updating time entry:', entryId, entryData)

      const { data, error: updateError } = await supabase
        .from('time_entries')
        .update({
          start_time: entryData.start_time,
          end_time: entryData.end_time,
          lunch_break_minutes: entryData.lunch_break_minutes
        })
        .eq('id', entryId)
        .eq('user_id', user.value.id) // Ensure user can only update their own entries
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
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

      console.log('Time entry updated:', data)

      // Update global state
      if (data) {
        const index = globalTimeEntries.value.findIndex(entry => entry.id === entryId)
        if (index !== -1) {
          globalTimeEntries.value[index] = data
        }
        if (currentEntry.value?.id === entryId) {
          currentEntry.value = data
        }
      }

      return {
        data: data,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update time entry'
      console.error('Update time entry error:', err)
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

  async function deleteTimeEntry(entryId: string): Promise<DetailedApiResponse<boolean>> {
    if (!user.value) {
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

      const { error: deleteError } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.value.id) // Ensure user can only delete their own entries

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

      // Remove from global state
      globalTimeEntries.value = globalTimeEntries.value.filter(entry => entry.id !== entryId)
      if (currentEntry.value?.id === entryId) {
        currentEntry.value = null
      }

      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete time entry'
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

  // Utility functions
  function calculateTotalHours(startTime: string, endTime: string, lunchMinutes: number): number {
    try {
      const start = new Date(`2000-01-01T${startTime}:00`)
      const end = new Date(`2000-01-01T${endTime}:00`)
      
      const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      const workingMinutes = totalMinutes - lunchMinutes
      
      return Math.max(0, workingMinutes / 60)
    } catch {
      return 0
    }
  }

  function validateTimeEntry(data: TimeEntryFormData): string[] {
    const errors: string[] = []

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    
    if (!timeRegex.test(data.start_time)) {
      errors.push('Start time must be in HH:MM format')
    }
    
    if (!timeRegex.test(data.end_time)) {
      errors.push('End time must be in HH:MM format')
    }

    // Validate lunch minutes
    if (data.lunch_break_minutes < 0 || data.lunch_break_minutes > 480) {
      errors.push('Lunch break must be between 0 and 480 minutes')
    }

    // Validate time range
    if (timeRegex.test(data.start_time) && timeRegex.test(data.end_time)) {
      const start = new Date(`2000-01-01T${data.start_time}:00`)
      const end = new Date(`2000-01-01T${data.end_time}:00`)
      
      if (start >= end) {
        errors.push('End time must be after start time')
      }
    }

    return errors
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    loading: computed(() => globalLoading.value),
    error: computed(() => error.value),
    timeEntries: computed(() => globalTimeEntries.value),
    currentEntry: computed(() => currentEntry.value),
    todayEntry,
    weeklyHours,
    monthlyHours,
    
    // Methods
    fetchTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    calculateTotalHours,
    validateTimeEntry,
    clearError
  }
}