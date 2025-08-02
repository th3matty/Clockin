// API-specific types and interfaces

import type {
  User,
  TimeEntry,
  HolidayRequest,
  Notification,
  UserStats,
  AdminStats,
  ExportOptions
} from './index'

import type { SupabaseResponse, SupabaseError } from './utils'

// Generic API response wrapper with additional success flag
export interface DetailedApiResponse<T = any> {
  data: T | null
  error: ApiError | null
  loading: boolean
  success: boolean
}

// Error types
export interface ApiError {
  message: string
  code?: string | number
  details?: string
  field?: string
}

// Authentication API types
export interface AuthResponse {
  user: User | null
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  } | null
  error: ApiError | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest extends LoginRequest {
  full_name: string
  role?: 'employee' | 'admin'
}

// User management API types
export interface GetUsersResponse {
  users: User[]
  total: number
}

export interface UpdateUserRequest {
  full_name?: string
  avatar_url?: string
  holiday_allowance?: number
  default_start_time?: string
  default_lunch_minutes?: number
  default_end_time?: string
}

// Time entries API types
export interface GetTimeEntriesRequest {
  user_id?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface GetTimeEntriesResponse {
  entries: TimeEntry[]
  total: number
}

export interface CreateTimeEntryRequest {
  date: string
  start_time: string
  end_time: string
  lunch_break_minutes: number
}

export interface UpdateTimeEntryRequest {
  start_time?: string
  end_time?: string
  lunch_break_minutes?: number
}

// Holiday requests API types
export interface GetHolidayRequestsRequest {
  user_id?: string
  status?: 'pending' | 'approved' | 'denied'
  year?: number
  limit?: number
  offset?: number
}

export interface GetHolidayRequestsResponse {
  requests: HolidayRequest[]
  total: number
}

export interface CreateHolidayRequestRequest {
  start_date: string
  end_date: string
  reason?: string
}

export interface UpdateHolidayRequestRequest {
  status?: 'approved' | 'denied'
  admin_notes?: string
}

// Notifications API types
export interface GetNotificationsRequest {
  user_id?: string
  read?: boolean
  limit?: number
  offset?: number
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  total: number
  unread_count: number
}

export interface MarkNotificationReadRequest {
  notification_id: string
}

// Statistics API types
export interface GetUserStatsRequest {
  user_id: string
  date?: string
}

export interface GetUserStatsResponse {
  stats: UserStats
}

export interface GetAdminStatsResponse {
  stats: AdminStats
}

// Export API types
export interface ExportDataRequest extends ExportOptions {
  user_ids?: string[]
}

export interface ExportDataResponse {
  file_url: string
  file_name: string
  expires_at: string
}

// File upload types
export interface UploadAvatarRequest {
  file: File
  user_id: string
}

export interface UploadAvatarResponse {
  avatar_url: string
}

// Real-time subscription types
export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
  table: string
}

export interface NotificationPayload extends RealtimePayload<Notification> {}
export interface HolidayRequestPayload extends RealtimePayload<HolidayRequest> {}
export interface TimeEntryPayload extends RealtimePayload<TimeEntry> {}

// Pagination types
export interface PaginationParams {
  page: number
  per_page: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedApiResponse<T> extends DetailedApiResponse<T[]> {
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Query builder types for Supabase
export interface QueryOptions {
  select?: string
  filter?: Record<string, any>
  order?: {
    column: string
    ascending?: boolean
  }
  range?: {
    from: number
    to: number
  }
}

// Batch operation types
export interface BatchOperation<T> {
  operation: 'insert' | 'update' | 'delete'
  data: T | T[]
  filter?: Record<string, any>
}

export interface BatchResponse<T> {
  results: DetailedApiResponse<T>[]
  success_count: number
  error_count: number
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  database: 'connected' | 'disconnected'
  storage: 'available' | 'unavailable'
  timestamp: string
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset_time: number
}

export interface RateLimitedResponse<T> extends DetailedApiResponse<T> {
  rate_limit: RateLimitInfo
}