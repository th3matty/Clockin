import { computed, ref } from 'vue'
import { useAuth } from './useAuth'
import { supabase } from '@/utils/supabase'
import type { DetailedApiResponse } from '@/types'

export interface OvertimeBalanceData {
  currentBalance: number
  weeklyTarget: number
  workingDaysPerWeek: number
  dailyTarget: number
  balanceStatus: 'positive' | 'negative' | 'zero'
}

export interface BalanceTransaction {
  date: string
  actualHours: number
  targetHours: number
  overtimeHours: number
  balanceChange: number
  newBalance: number
}

export function useOvertimeBalance() {
  const { user, updateProfile } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const overtimeBalance = computed(() => user.value?.overtime_balance || 0)
  const workingDaysPerWeek = computed(() => user.value?.working_days_per_week || 5)
  const weeklyTarget = computed(() => user.value?.weekly_target_hours || 40)

  const dailyTarget = computed(() => {
    return calculateDailyTarget(weeklyTarget.value, workingDaysPerWeek.value)
  })

  const balanceStatus = computed((): 'positive' | 'negative' | 'zero' => {
    const balance = overtimeBalance.value
    if (balance > 0) return 'positive'
    if (balance < 0) return 'negative'
    return 'zero'
  })

  const balanceStatusColor = computed(() => {
    switch (balanceStatus.value) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      case 'zero':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  })

  const balanceStatusText = computed(() => {
    switch (balanceStatus.value) {
      case 'positive':
        return 'Credit Balance'
      case 'negative':
        return 'Deficit Balance'
      case 'zero':
        return 'Balanced'
      default:
        return 'Unknown'
    }
  })

  // Display formatting functions
  function formatOvertimeBalance(hours: number): string {
    const absHours = Math.abs(hours)
    const sign = hours >= 0 ? '+' : '-'

    // If less than 1 hour, show in minutes only
    if (absHours < 1) {
      const minutes = Math.round(absHours * 60)
      return `${sign}${minutes}min`
    }

    // If 1 hour or more, show hours and minutes format
    const wholeHours = Math.floor(absHours)
    const remainingMinutes = Math.round((absHours - wholeHours) * 60)

    if (remainingMinutes === 0) {
      return `${sign}${wholeHours}h`
    } else {
      return `${sign}${wholeHours}h ${remainingMinutes}min`
    }
  }

  // Core calculation functions
  function calculateDailyTarget(weeklyHours: number, workingDays: number): number {
    if (workingDays === 0) return 0
    return Math.round((weeklyHours / workingDays) * 100) / 100
  }

  function validateDailyTarget(weeklyHours: number, workingDays: number): boolean {
    const dailyTarget = calculateDailyTarget(weeklyHours, workingDays)
    return dailyTarget <= 12
  }

  function calculateBalanceChange(
    actualHours: number,
    targetHours: number,
    overtimeHours: number = 0
  ): number {
    const totalWorked = actualHours + overtimeHours
    const difference = totalWorked - targetHours
    return Math.round(difference * 100) / 100
  }

  function calculateNewBalance(
    currentBalance: number,
    balanceChange: number
  ): number {
    const newBalance = currentBalance + balanceChange
    return Math.round(newBalance * 100) / 100
  }

  // Validation functions
  function validateWorkingDaysSettings(weeklyHours: number, workingDays: number): string[] {
    const errors: string[] = []

    if (workingDays < 1 || workingDays > 7) {
      errors.push('Working days must be between 1 and 7 days per week')
    }

    if (weeklyHours < 20 || weeklyHours > 60) {
      errors.push('Weekly target hours must be between 20 and 60 hours')
    }

    const dailyTarget = calculateDailyTarget(weeklyHours, workingDays)
    if (dailyTarget > 12) {
      errors.push(`Daily target of ${dailyTarget.toFixed(1)} hours exceeds 12-hour limit. Please increase working days or reduce weekly hours.`)
    }

    return errors
  }

  // Database operations
  async function updateOvertimeBalance(newBalance: number): Promise<DetailedApiResponse<boolean>> {
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

      // Use the auth store's updateProfile method to ensure proper reactivity
      const result = await updateProfile({ overtime_balance: newBalance })

      if (!result.success) {
        error.value = result.error?.message || 'Failed to update overtime balance'
        return {
          data: false,
          error: result.error || { message: 'Failed to update overtime balance' },
          loading: false,
          success: false
        }
      }

      return {
        data: true,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update overtime balance'
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

  async function recalculateOvertimeBalance(
    timeEntries: any[]
  ): Promise<DetailedApiResponse<number>> {
    if (!user.value) {
      return {
        data: null,
        error: { message: 'Not authenticated' },
        loading: false,
        success: false
      }
    }

    try {
      const targetHours = dailyTarget.value

      // Only calculate balance if we have valid target hours
      if (targetHours <= 0) {
        return {
          data: null,
          error: { message: 'Invalid daily target hours' },
          loading: false,
          success: false
        }
      }

      // Calculate total balance based on ALL time entries
      let totalBalance = 0

      for (const entry of timeEntries) {
        const actualHours = entry.total_hours || 0
        const overtimeHours = entry.overtime_hours || 0
        const totalWorked = actualHours + overtimeHours
        const dailyBalance = totalWorked - targetHours
        totalBalance += dailyBalance
      }

      // Round to avoid floating-point precision issues
      totalBalance = Math.round(totalBalance * 100) / 100

      // Only update if there's a significant difference from current balance
      const currentBalance = overtimeBalance.value
      if (Math.abs(totalBalance - currentBalance) < 0.01) {
        return {
          data: currentBalance,
          error: null,
          loading: false,
          success: true
        }
      }

      // Update the balance in the database
      const updateResult = await updateOvertimeBalance(totalBalance)

      if (!updateResult.success) {
        return {
          data: null,
          error: updateResult.error,
          loading: false,
          success: false
        }
      }

      return {
        data: totalBalance,
        error: null,
        loading: false,
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to recalculate overtime balance'
      error.value = errorMessage

      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    }
  }

  // Legacy function for backward compatibility - now just calls recalculate
  async function processTimeEntryBalanceUpdate(
    actualHours: number,
    overtimeHours: number = 0
  ): Promise<DetailedApiResponse<BalanceTransaction>> {
    // This function is now deprecated - we should recalculate the entire balance
    // instead of trying to add/subtract individual changes
    const transaction: BalanceTransaction = {
      date: new Date().toISOString().split('T')[0],
      actualHours,
      targetHours: dailyTarget.value,
      overtimeHours,
      balanceChange: 0, // No longer relevant
      newBalance: overtimeBalance.value
    }

    return {
      data: transaction,
      error: null,
      loading: false,
      success: true
    }
  }

  function clearError() {
    error.value = null
  }

  // Utility function to reset balance to correct value based on all time entries
  async function resetOvertimeBalanceFromEntries(timeEntries: any[]): Promise<DetailedApiResponse<number>> {
    if (!user.value) {
      return {
        data: null,
        error: { message: 'Not authenticated' },
        loading: false,
        success: false
      }
    }

    try {
      // Force recalculation by setting balance to 0 first, then recalculating
      const result = await recalculateOvertimeBalance(timeEntries)

      if (result.success && result.data !== null) {
        console.log(`Overtime balance reset to: ${result.data}h based on ${timeEntries.length} time entries`)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset overtime balance'
      error.value = errorMessage

      return {
        data: null,
        error: { message: errorMessage },
        loading: false,
        success: false
      }
    }
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Computed properties
    overtimeBalance,
    workingDaysPerWeek,
    weeklyTarget,
    dailyTarget,
    balanceStatus,
    balanceStatusColor,
    balanceStatusText,

    // Calculation functions
    calculateDailyTarget,
    validateDailyTarget,
    calculateBalanceChange,
    calculateNewBalance,
    validateWorkingDaysSettings,

    // Display functions
    formatOvertimeBalance,

    // Database operations
    updateOvertimeBalance,
    recalculateOvertimeBalance,
    resetOvertimeBalanceFromEntries,
    processTimeEntryBalanceUpdate,
    clearError
  }
}