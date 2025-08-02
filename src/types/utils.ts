// Utility types for the application

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Database operation types
export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// API operation types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// Form state types
export interface FormState<T> {
  data: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Supabase specific types
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// Time-related utility types
export type TimeFormat = '24h' | '12h';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  id?: string;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | null;
  onRetry?: () => void;
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Navigation types
export interface RouteParams {
  [key: string]: string | undefined;
}

export interface NavigationItem {
  name: string;
  path: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: UserRole[];
}

import type { UserRole, FormErrors } from './index'