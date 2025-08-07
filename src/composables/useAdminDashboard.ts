import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import type { AdminUser, ActivityFeedItem } from '@/types'

export function useAdminDashboard() {
  const teamMembers = ref<AdminUser[]>([])
  const activities = ref<ActivityFeedItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all team members with their current stats
   */
  async function fetchTeamMembers() {
    loading.value = true
    error.value = null

    try {
      // Get all users except admins
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          role,
          holiday_allowance,
          created_at
        `)
        .neq('role', 'admin')
        .order('full_name')

      if (usersError) {
        console.error('Error fetching users:', usersError)
        throw usersError
      }





      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0]
      const startOfWeek = getStartOfWeek(new Date()).toISOString().split('T')[0]
      const endOfWeek = getEndOfWeek(new Date()).toISOString().split('T')[0]

      // Fetch time entries for today and this week for all users
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('user_id, date, total_hours, overtime_hours')
        .gte('date', startOfWeek)
        .lte('date', endOfWeek)

      if (timeError) throw timeError

      // Fetch holiday requests for remaining holidays calculation
      const { data: holidayRequests, error: holidayError } = await supabase
        .from('holiday_requests')
        .select('user_id, days_requested, status, start_date')
        .eq('status', 'approved')
        .gte('start_date', new Date().getFullYear() + '-01-01')
        .lt('start_date', (new Date().getFullYear() + 1) + '-01-01')

      if (holidayError) throw holidayError

      // Process team members data
      const processedMembers: AdminUser[] = users?.map(user => {
        // Calculate daily hours (today)
        const todayEntries = timeEntries?.filter(entry => 
          entry.user_id === user.id && entry.date === today
        ) || []
        const dailyHours = todayEntries.reduce((sum, entry) => 
          sum + (entry.total_hours || 0) + (entry.overtime_hours || 0), 0
        )

        // Calculate weekly hours
        const weekEntries = timeEntries?.filter(entry => 
          entry.user_id === user.id
        ) || []
        const weeklyHours = weekEntries.reduce((sum, entry) => 
          sum + (entry.total_hours || 0) + (entry.overtime_hours || 0), 0
        )

        // Calculate remaining holidays
        const usedHolidays = holidayRequests?.filter(request => 
          request.user_id === user.id
        ).reduce((sum, request) => sum + request.days_requested, 0) || 0
        const remainingHolidays = (user.holiday_allowance || 25) - usedHolidays

        // Determine status based on daily hours and recent activity
        let status: 'active' | 'inactive' | 'on_holiday' | 'offline'
        
        if (dailyHours > 0) {
          status = 'active'
        } else {
          // Check if user is on holiday today
          const todayHolidays = holidayRequests?.filter(request => 
            request.user_id === user.id && 
            request.start_date <= today &&
            request.status === 'approved'
          ) || []
          
          if (todayHolidays.length > 0) {
            status = 'on_holiday'
          } else {
            status = 'inactive'
          }
        }

        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url,
          role: user.role,
          daily_hours: Math.round(dailyHours * 100) / 100,
          weekly_hours: Math.round(weeklyHours * 100) / 100,
          remaining_holidays: remainingHolidays,
          status
        }
      }) || []

      teamMembers.value = processedMembers
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch team members'
      console.error('Error fetching team members:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch recent activities (holiday requests, time entries, etc.)
   */
  async function fetchActivities() {
    try {
      // Fetch recent holiday requests
      const { data: holidayRequests, error: holidayError } = await supabase
        .from('holiday_requests')
        .select(`
          id,
          user_id,
          start_date,
          end_date,
          days_requested,
          reason,
          status,
          created_at,
          users!inner(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (holidayError) throw holidayError

      // Process activities
      const processedActivities: ActivityFeedItem[] = holidayRequests?.map(request => ({
        id: request.id,
        type: 'holiday_request' as const,
        user_name: (request.users as any).full_name,
        message: `Requested ${request.days_requested} day${request.days_requested > 1 ? 's' : ''} holiday - ${request.reason || 'No reason provided'}`,
        timestamp: request.created_at,
        actionable: request.status === 'pending',
        holiday_request_id: request.id,
        metadata: {
          start_date: request.start_date,
          end_date: request.end_date,
          days_requested: request.days_requested,
          reason: request.reason,
          status: request.status
        }
      })) || []

      activities.value = processedActivities
    } catch (err) {
      console.error('Error fetching activities:', err)
    }
  }

  /**
   * Approve a holiday request
   */
  async function approveHolidayRequest(requestId: string) {
    try {
      const { error } = await supabase
        .from('holiday_requests')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      // Refresh activities and team data
      await Promise.all([
        fetchActivities(),
        fetchTeamMembers()
      ])
    } catch (err) {
      console.error('Error approving holiday request:', err)
      throw err
    }
  }

  /**
   * Deny a holiday request
   */
  async function denyHolidayRequest(requestId: string, reason?: string) {
    try {
      const { error } = await supabase
        .from('holiday_requests')
        .update({ 
          status: 'denied',
          admin_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      // Refresh activities and team data
      await Promise.all([
        fetchActivities(),
        fetchTeamMembers()
      ])
    } catch (err) {
      console.error('Error denying holiday request:', err)
      throw err
    }
  }

  // Helper functions
  function getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  function getEndOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? 0 : 7) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  function clearError() {
    error.value = null
  }

  // Computed
  const totalTeamMembers = computed(() => teamMembers.value.length)
  const activeMembers = computed(() => 
    teamMembers.value.filter(member => member.status === 'active').length
  )
  const pendingRequests = computed(() => 
    activities.value.filter(activity => activity.actionable).length
  )

  return {
    // State
    teamMembers,
    activities,
    loading,
    error,
    
    // Computed
    totalTeamMembers,
    activeMembers,
    pendingRequests,
    
    // Methods
    fetchTeamMembers,
    fetchActivities,
    approveHolidayRequest,
    denyHolidayRequest,
    clearError
  }
}