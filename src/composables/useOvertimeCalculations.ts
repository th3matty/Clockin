import { computed } from 'vue'
import type { TimeEntry } from '@/types'

export interface OvertimeStats {
  weeklyRegularHours: number
  weeklyOvertimeHours: number
  weeklyTotalHours: number
  monthlyRegularHours: number
  monthlyOvertimeHours: number
  monthlyTotalHours: number
  weeklyTarget: number
  overtimeStatus: 'normal' | 'moderate' | 'excessive'
}

export interface OvertimeDisplayData {
  regularHours: number
  overtimeHours: number
  totalHours: number
  hasOvertime: boolean
  displayText: string
}

export function useOvertimeCalculations() {
  
  /**
   * Calculate comprehensive overtime statistics for weekly and monthly periods
   */
  function calculateOvertimeStats(entries: TimeEntry[], weeklyTarget: number = 40, workingDaysPerWeek: number = 5): OvertimeStats {
    const today = new Date()
    
    // Calculate week boundaries (Monday to Sunday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
    
    // Calculate month boundaries
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const startWeekDate = startOfWeek.toISOString().split('T')[0]
    const endWeekDate = endOfWeek.toISOString().split('T')[0]
    const startMonthDate = startOfMonth.toISOString().split('T')[0]
    const endMonthDate = endOfMonth.toISOString().split('T')[0]
    
    // Filter entries for current week
    const weekEntries = entries.filter(entry => 
      entry.date >= startWeekDate && entry.date <= endWeekDate
    )
    
    // Filter entries for current month
    const monthEntries = entries.filter(entry => 
      entry.date >= startMonthDate && entry.date <= endMonthDate
    )
    
    // Calculate weekly totals
    const weeklyRegularHours = weekEntries.reduce((sum, entry) => sum + entry.total_hours, 0)
    const weeklyOvertimeHours = weekEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0)
    const weeklyTotalHours = weeklyRegularHours + weeklyOvertimeHours
    
    // Calculate monthly totals
    const monthlyRegularHours = monthEntries.reduce((sum, entry) => sum + entry.total_hours, 0)
    const monthlyOvertimeHours = monthEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0)
    const monthlyTotalHours = monthlyRegularHours + monthlyOvertimeHours
    
    // Determine overtime status
    const overtimeStatus = getOvertimeStatus(weeklyOvertimeHours)
    
    return {
      weeklyRegularHours: Math.round(weeklyRegularHours * 100) / 100,
      weeklyOvertimeHours: Math.round(weeklyOvertimeHours * 100) / 100,
      weeklyTotalHours: Math.round(weeklyTotalHours * 100) / 100,
      monthlyRegularHours: Math.round(monthlyRegularHours * 100) / 100,
      monthlyOvertimeHours: Math.round(monthlyOvertimeHours * 100) / 100,
      monthlyTotalHours: Math.round(monthlyTotalHours * 100) / 100,
      weeklyTarget,
      overtimeStatus
    }
  }
  
  /**
   * Determine overtime status based on weekly overtime hours
   */
  function getOvertimeStatus(weeklyOvertimeHours: number): 'normal' | 'moderate' | 'excessive' {
    if (weeklyOvertimeHours === 0) return 'normal'
    if (weeklyOvertimeHours <= 5) return 'moderate'  // Up to 5 hours overtime per week
    return 'excessive'  // More than 5 hours overtime per week
  }
  
  /**
   * Get color classes for overtime status display
   */
  function getOvertimeStatusColor(status: 'normal' | 'moderate' | 'excessive'): string {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-orange-100 text-orange-800'
      case 'excessive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  /**
   * Get text description for overtime status
   */
  function getOvertimeStatusText(status: 'normal' | 'moderate' | 'excessive'): string {
    switch (status) {
      case 'normal':
        return 'Normal'
      case 'moderate':
        return 'Moderate Overtime'
      case 'excessive':
        return 'Excessive Overtime'
      default:
        return 'Unknown'
    }
  }
  
  /**
   * Format overtime display data for a single time entry
   */
  function formatOvertimeDisplay(regularHours: number, overtimeHours: number = 0): OvertimeDisplayData {
    const totalHours = regularHours + overtimeHours
    const hasOvertime = overtimeHours > 0
    
    let displayText = `${regularHours.toFixed(2)}h`
    if (hasOvertime) {
      displayText += ` + ${overtimeHours.toFixed(2)}h overtime`
    }
    
    return {
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      totalHours: Math.round(totalHours * 100) / 100,
      hasOvertime,
      displayText
    }
  }
  
  /**
   * Calculate total daily hours including overtime
   */
  function calculateTotalDailyHours(entry: TimeEntry): number {
    const regularHours = entry.total_hours
    const overtimeHours = entry.overtime_hours || 0
    const total = regularHours + overtimeHours
    
    return Math.round(total * 100) / 100
  }
  
  /**
   * Get daily target hours based on weekly target and working days
   */
  function getDailyTargetHours(weeklyTarget: number = 40, workingDaysPerWeek: number = 5): number {
    const dailyTarget = weeklyTarget / workingDaysPerWeek
    return Math.round(dailyTarget * 100) / 100
  }
  
  /**
   * Check if a time entry has overtime hours
   */
  function hasOvertimeHours(entry: TimeEntry): boolean {
    return (entry.overtime_hours || 0) > 0
  }
  
  /**
   * Validate overtime hours input
   */
  function validateOvertimeHours(overtimeHours: number): string[] {
    const errors: string[] = []
    
    if (overtimeHours < 0) {
      errors.push('Overtime hours cannot be negative')
    }
    
    if (overtimeHours > 12) {
      errors.push('Overtime hours cannot exceed 12 hours per day')
    }
    
    // Check for reasonable decimal precision (max 2 decimal places)
    const decimalPlaces = (overtimeHours.toString().split('.')[1] || '').length
    if (decimalPlaces > 2) {
      errors.push('Overtime hours can have at most 2 decimal places')
    }
    
    return errors
  }
  
  /**
   * Calculate overtime progress toward weekly target
   */
  function calculateOvertimeProgress(
    weeklyOvertimeHours: number,
    weeklyTarget: number = 40,
    workingDaysPerWeek: number = 5
  ): {
    percentage: number
    isOverTarget: boolean
    hoursOverTarget: number
  } {
    // Consider moderate overtime threshold (5 hours) as 100% progress
    const moderateThreshold = 5
    const percentage = Math.min((weeklyOvertimeHours / moderateThreshold) * 100, 100)
    const isOverTarget = weeklyOvertimeHours > moderateThreshold
    const hoursOverTarget = Math.max(0, weeklyOvertimeHours - moderateThreshold)
    
    return {
      percentage: Math.round(percentage * 100) / 100,
      isOverTarget,
      hoursOverTarget: Math.round(hoursOverTarget * 100) / 100
    }
  }
  
  return {
    // Core calculation functions
    calculateOvertimeStats,
    getOvertimeStatus,
    getOvertimeStatusColor,
    getOvertimeStatusText,
    formatOvertimeDisplay,
    calculateTotalDailyHours,
    getDailyTargetHours,
    hasOvertimeHours,
    validateOvertimeHours,
    calculateOvertimeProgress
  }
}