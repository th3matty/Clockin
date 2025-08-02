// Type guards and validation helpers

import type {
  User,
  UserRole,
  TimeEntry,
  HolidayRequest,
  HolidayStatus,
  Notification,
  NotificationType,
  AuthUser,
  UserStatus,
  ExportFormat
} from './index'

// User type guards
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.full_name === 'string' &&
    isUserRole(obj.role) &&
    typeof obj.holiday_allowance === 'number' &&
    typeof obj.default_start_time === 'string' &&
    typeof obj.default_lunch_minutes === 'number' &&
    typeof obj.default_end_time === 'string' &&
    typeof obj.created_at === 'string'
  )
}

export function isUserRole(role: any): role is UserRole {
  return role === 'employee' || role === 'admin'
}

export function isAuthUser(obj: any): obj is AuthUser {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.full_name === 'string' &&
    isUserRole(obj.role)
  )
}

export function isUserStatus(status: any): status is UserStatus {
  return status === 'active' || status === 'on_holiday' || status === 'offline'
}

// Time entry type guards
export function isTimeEntry(obj: any): obj is TimeEntry {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.start_time === 'string' &&
    typeof obj.end_time === 'string' &&
    typeof obj.lunch_break_minutes === 'number' &&
    typeof obj.total_hours === 'number' &&
    typeof obj.created_at === 'string'
  )
}

// Holiday request type guards
export function isHolidayRequest(obj: any): obj is HolidayRequest {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.start_date === 'string' &&
    typeof obj.end_date === 'string' &&
    typeof obj.days_requested === 'number' &&
    isHolidayStatus(obj.status) &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  )
}

export function isHolidayStatus(status: any): status is HolidayStatus {
  return status === 'pending' || status === 'approved' || status === 'denied'
}

// Notification type guards
export function isNotification(obj: any): obj is Notification {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    isNotificationType(obj.type) &&
    typeof obj.title === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.read === 'boolean' &&
    typeof obj.created_at === 'string'
  )
}

export function isNotificationType(type: any): type is NotificationType {
  return type === 'holiday_request' || type === 'holiday_approved' || type === 'holiday_denied'
}

// Export format type guard
export function isExportFormat(format: any): format is ExportFormat {
  return format === 'pdf' || format === 'csv' || format === 'excel'
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

export function isValidDate(date: string): boolean {
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().split('T')[0] === date
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function isValidLunchMinutes(minutes: number): boolean {
  return minutes >= 0 && minutes <= 480 // 0 to 8 hours
}

export function isValidHolidayAllowance(days: number): boolean {
  return days >= 0 && days <= 365
}

export function isWorkingDay(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5 // Monday to Friday
}

export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false
  }
  
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  return start < end
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false
  }
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return start <= end
}

// Array type guards
export function isUserArray(arr: any[]): arr is User[] {
  return Array.isArray(arr) && arr.every(isUser)
}

export function isTimeEntryArray(arr: any[]): arr is TimeEntry[] {
  return Array.isArray(arr) && arr.every(isTimeEntry)
}

export function isHolidayRequestArray(arr: any[]): arr is HolidayRequest[] {
  return Array.isArray(arr) && arr.every(isHolidayRequest)
}

export function isNotificationArray(arr: any[]): arr is Notification[] {
  return Array.isArray(arr) && arr.every(isNotification)
}

// Utility functions for type checking
export function assertIsUser(obj: any): asserts obj is User {
  if (!isUser(obj)) {
    throw new Error('Object is not a valid User')
  }
}

export function assertIsTimeEntry(obj: any): asserts obj is TimeEntry {
  if (!isTimeEntry(obj)) {
    throw new Error('Object is not a valid TimeEntry')
  }
}

export function assertIsHolidayRequest(obj: any): asserts obj is HolidayRequest {
  if (!isHolidayRequest(obj)) {
    throw new Error('Object is not a valid HolidayRequest')
  }
}

export function assertIsNotification(obj: any): asserts obj is Notification {
  if (!isNotification(obj)) {
    throw new Error('Object is not a valid Notification')
  }
}