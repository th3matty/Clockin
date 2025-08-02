// Form validation schemas and rules

import {
  isValidEmail,
  isValidTime,
  isValidDate,
  isValidPassword,
  isValidLunchMinutes,
  isValidTimeRange,
  isValidDateRange
} from './guards'

import type { ValidationRule, FormErrors } from './index'

// Validation rule definitions
export const validationRules = {
  email: {
    required: true,
    custom: (value: string) => isValidEmail(value) || 'Please enter a valid email address'
  } as ValidationRule,

  password: {
    required: true,
    min: 8,
    custom: (value: string) => isValidPassword(value) || 'Password must be at least 8 characters with uppercase, lowercase, and number'
  } as ValidationRule,

  fullName: {
    required: true,
    min: 2,
    max: 100,
    custom: (value: string) => value.trim().length >= 2 || 'Full name must be at least 2 characters'
  } as ValidationRule,

  time: {
    required: true,
    custom: (value: string) => isValidTime(value) || 'Please enter a valid time (HH:MM)'
  } as ValidationRule,

  date: {
    required: true,
    custom: (value: string) => isValidDate(value) || 'Please enter a valid date'
  } as ValidationRule,

  lunchMinutes: {
    required: true,
    min: 0,
    max: 480,
    custom: (value: number) => isValidLunchMinutes(value) || 'Lunch break must be between 0 and 480 minutes'
  } as ValidationRule,

  holidayReason: {
    required: false,
    max: 500,
    custom: (value: string) => !value || value.length <= 500 || 'Reason must be less than 500 characters'
  } as ValidationRule
}

// Form validation schemas
export interface LoginFormSchema {
  email: string
  password: string
}

export interface SignupFormSchema extends LoginFormSchema {
  full_name: string
  confirmPassword: string
}

export interface TimeEntryFormSchema {
  start_time: string
  end_time: string
  lunch_break_minutes: number
}

export interface HolidayRequestFormSchema {
  start_date: string
  end_date: string
  reason?: string
}

export interface UserSettingsFormSchema {
  default_start_time: string
  default_end_time: string
  default_lunch_minutes: number
}

// Validation functions
export function validateLoginForm(data: LoginFormSchema): FormErrors {
  const errors: FormErrors = {}

  if (!data.email) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}

export function validateSignupForm(data: SignupFormSchema): FormErrors {
  const errors = validateLoginForm(data)

  if (!data.full_name) {
    errors.full_name = 'Full name is required'
  } else if (data.full_name.trim().length < 2) {
    errors.full_name = 'Full name must be at least 2 characters'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export function validateTimeEntryForm(data: TimeEntryFormSchema): FormErrors {
  const errors: FormErrors = {}

  if (!data.start_time) {
    errors.start_time = 'Start time is required'
  } else if (!isValidTime(data.start_time)) {
    errors.start_time = 'Please enter a valid start time'
  }

  if (!data.end_time) {
    errors.end_time = 'End time is required'
  } else if (!isValidTime(data.end_time)) {
    errors.end_time = 'Please enter a valid end time'
  }

  if (data.start_time && data.end_time && !isValidTimeRange(data.start_time, data.end_time)) {
    errors.end_time = 'End time must be after start time'
  }

  if (data.lunch_break_minutes < 0 || data.lunch_break_minutes > 480) {
    errors.lunch_break_minutes = 'Lunch break must be between 0 and 480 minutes'
  }

  return errors
}

export function validateHolidayRequestForm(data: HolidayRequestFormSchema): FormErrors {
  const errors: FormErrors = {}

  if (!data.start_date) {
    errors.start_date = 'Start date is required'
  } else if (!isValidDate(data.start_date)) {
    errors.start_date = 'Please enter a valid start date'
  }

  if (!data.end_date) {
    errors.end_date = 'End date is required'
  } else if (!isValidDate(data.end_date)) {
    errors.end_date = 'Please enter a valid end date'
  }

  if (data.start_date && data.end_date && !isValidDateRange(data.start_date, data.end_date)) {
    errors.end_date = 'End date must be on or after start date'
  }

  if (data.reason && data.reason.length > 500) {
    errors.reason = 'Reason must be less than 500 characters'
  }

  return errors
}

export function validateUserSettingsForm(data: UserSettingsFormSchema): FormErrors {
  const errors: FormErrors = {}

  if (!data.default_start_time) {
    errors.default_start_time = 'Default start time is required'
  } else if (!isValidTime(data.default_start_time)) {
    errors.default_start_time = 'Please enter a valid start time'
  }

  if (!data.default_end_time) {
    errors.default_end_time = 'Default end time is required'
  } else if (!isValidTime(data.default_end_time)) {
    errors.default_end_time = 'Please enter a valid end time'
  }

  if (data.default_start_time && data.default_end_time && 
      !isValidTimeRange(data.default_start_time, data.default_end_time)) {
    errors.default_end_time = 'End time must be after start time'
  }

  if (data.default_lunch_minutes < 0 || data.default_lunch_minutes > 480) {
    errors.default_lunch_minutes = 'Lunch break must be between 0 and 480 minutes'
  }

  return errors
}

// Generic validation helper
export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required'
  }

  if (value && rules.min && typeof value === 'string' && value.length < rules.min) {
    return `Must be at least ${rules.min} characters`
  }

  if (value && rules.max && typeof value === 'string' && value.length > rules.max) {
    return `Must be no more than ${rules.max} characters`
  }

  if (value && rules.min && typeof value === 'number' && value < rules.min) {
    return `Must be at least ${rules.min}`
  }

  if (value && rules.max && typeof value === 'number' && value > rules.max) {
    return `Must be no more than ${rules.max}`
  }

  if (value && rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return 'Invalid format'
  }

  if (value && rules.custom) {
    const result = rules.custom(value)
    if (typeof result === 'string') {
      return result
    }
    if (result === false) {
      return 'Invalid value'
    }
  }

  return null
}

// Form state helpers
export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(error => error !== undefined && error !== null)
}

export function getFirstError(errors: FormErrors): string | null {
  const firstError = Object.values(errors).find(error => error !== undefined && error !== null)
  return firstError || null
}

export function clearErrors(errors: FormErrors): FormErrors {
  const clearedErrors: FormErrors = {}
  Object.keys(errors).forEach(key => {
    clearedErrors[key] = undefined
  })
  return clearedErrors
}