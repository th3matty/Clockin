// Core type definitions for the application

// User-related types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  holiday_allowance: number;
  default_start_time: string;
  default_lunch_minutes: number;
  default_end_time: string;
  weekly_target_hours: number; // NEW: For overtime calculation
  working_days_per_week: number; // NEW: For flexible working days (1-7)
  overtime_balance: number; // NEW: Accumulated overtime balance
  theme_preference?: 'light' | 'dark' | 'system'; // NEW: Theme preference
  created_at: string;
}

export type UserRole = 'employee' | 'admin';

export interface UserProfile extends Omit<User, 'created_at'> {
  // Extended user profile for UI components
}

// Time tracking types
export interface TimeEntry {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  lunch_break_minutes: number;
  total_hours: number;
  overtime_hours: number; // NEW: Additional overtime hours
  created_at: string;
}

export interface TimeEntryInput {
  date: string;
  start_time: string;
  end_time: string;
  lunch_break_minutes: number;
  overtime_hours?: number; // NEW: Optional overtime hours
}

export interface TimeEntryFormData {
  start_time: string;
  lunch_break_minutes: number;
  end_time: string;
  overtime_hours?: number; // NEW: Optional overtime hours
}

// Holiday request types
export interface HolidayRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: HolidayStatus;
  reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export type HolidayStatus = 'pending' | 'approved' | 'denied';

export interface HolidayRequestInput {
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface HolidayRequestFormData {
  start_date: Date | null;
  end_date: Date | null;
  reason: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export type NotificationType = 'holiday_request' | 'holiday_approved' | 'holiday_denied';

// Settings types
export interface UserSettings {
  default_start_time: string;
  default_lunch_minutes: number;
  default_end_time: string;
  avatar_url?: string;
  weekly_target_hours?: number; // NEW: For overtime calculation
  working_days_per_week?: number; // NEW: For flexible working days
}

export interface UserSettingsFormData {
  default_start_time: string;
  default_lunch_minutes: number;
  default_end_time: string;
  weekly_target_hours?: number; // NEW: For overtime calculation
  working_days_per_week?: number; // NEW: For flexible working days
  avatar_file?: File;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  default_start_time?: string;
  default_lunch_minutes?: number;
  default_end_time?: string;
  holiday_allowance?: number;
  weekly_target_hours?: number; // NEW: For overtime calculation
  working_days_per_week?: number; // NEW: For flexible working days
  overtime_balance?: number; // NEW: Accumulated overtime balance
  theme_preference?: 'light' | 'dark' | 'system'; // NEW: Theme preference
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  full_name: string;
  role?: UserRole;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
}

// Dashboard types
export interface UserCardData {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  daily_hours: number;
  weekly_hours: number;
  remaining_holidays: number;
}

export type UserStatus = 'active' | 'on_holiday' | 'offline';

export interface ActivityFeedItem {
  id: string;
  type: 'holiday_request' | 'time_entry' | 'user_update';
  user_name: string;
  message: string;
  timestamp: string;
  actionable?: boolean;
  holiday_request_id?: string;
}

// Export types
export interface ExportOptions {
  format: ExportFormat;
  date_range: DateRange;
  user_ids?: string[];
}

export type ExportFormat = 'pdf' | 'csv' | 'excel';

export interface DateRange {
  start_date: string;
  end_date: string;
}

// Calendar types
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasHoliday: boolean;
  holidayStatus?: HolidayStatus;
  isWeekend: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Statistics types
export interface UserStats {
  total_hours_today: number;
  total_hours_week: number;
  total_hours_month: number;
  remaining_holidays: number;
  pending_requests: number;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  pending_holiday_requests: number;
  total_hours_today: number;
}

// Re-export utility types and helpers
export * from './utils'
export * from './guards'
export * from './validation'
export * from './api'