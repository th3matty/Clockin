import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import type { User, TimeEntry, HolidayRequest } from '@/types'

export function useUserDetail() {
  // State
  const user = ref<User | null>(null)
  const timeEntries = ref<TimeEntry[]>([])
  const holidayRequests = ref<HolidayRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Methods
  async function fetchUserDetail(userId: string) {
    loading.value = true
    error.value = null

    try {
      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      user.value = userData

      // Fetch time entries for the last 3 months
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      const { data: timeData, error: timeError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', threeMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (timeError) throw timeError

      timeEntries.value = timeData || []

      // Fetch holiday requests for the current year
      const currentYear = new Date().getFullYear()
      const yearStart = `${currentYear}-01-01`
      const yearEnd = `${currentYear}-12-31`

      const { data: holidayData, error: holidayError } = await supabase
        .from('holiday_requests')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', yearStart)
        .lte('start_date', yearEnd)
        .order('created_at', { ascending: false })

      if (holidayError) throw holidayError

      holidayRequests.value = holidayData || []

    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user details'
      console.error('Error fetching user details:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateHolidayAllowance(userId: string, allowance: number) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ holiday_allowance: allowance })
        .eq('id', userId)

      if (error) throw error

      // Update local user data
      if (user.value) {
        user.value.holiday_allowance = allowance
      }

      return { success: true }
    } catch (err: any) {
      console.error('Error updating holiday allowance:', err)
      return { success: false, error: err.message }
    }
  }

  async function exportUserData(userId: string, userName: string) {
    try {
      // Create CSV content
      const csvContent = generateCSVContent()
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${userName.replace(/\s+/g, '_')}_time_data.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return { success: true }
    } catch (err: any) {
      console.error('Error exporting user data:', err)
      return { success: false, error: err.message }
    }
  }

  function generateCSVContent(): string {
    const headers = ['Date', 'Start Time', 'End Time', 'Lunch Break (min)', 'Regular Hours', 'Overtime Hours', 'Total Hours']
    const rows = timeEntries.value.map(entry => [
      entry.date,
      entry.start_time,
      entry.end_time,
      entry.lunch_break_minutes.toString(),
      entry.total_hours.toFixed(2),
      (entry.overtime_hours || 0).toFixed(2),
      (entry.total_hours + (entry.overtime_hours || 0)).toFixed(2)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    return csvContent
  }

  return {
    // State
    user,
    timeEntries,
    holidayRequests,
    loading,
    error,

    // Methods
    fetchUserDetail,
    updateHolidayAllowance,
    exportUserData
  }
}