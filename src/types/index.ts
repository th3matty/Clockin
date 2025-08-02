// Core type definitions for the application

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'employee' | 'admin';
  holiday_allowance: number;
  default_start_time: string;
  default_lunch_minutes: number;
  default_end_time: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  lunch_break_minutes: number;
  total_hours: number;
  created_at: string;
}

export interface UserSettings {
  default_start_time: string;
  default_lunch_minutes: number;
  default_end_time: string;
  avatar_url?: string;
}

export interface HolidayRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'pending' | 'approved' | 'denied';
  reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'holiday_request' | 'holiday_approved' | 'holiday_denied';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}