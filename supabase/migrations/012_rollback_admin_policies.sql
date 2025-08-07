-- Migration: Rollback Admin Policies (Emergency Fix)
-- Description: Rollback the problematic admin policies that are causing auth issues
-- Date: 2025-01-08

-- Drop all the problematic policies
DROP POLICY IF EXISTS "admins_can_view_all_users" ON users;
DROP POLICY IF EXISTS "admins_can_view_all_time_entries" ON time_entries;
DROP POLICY IF EXISTS "admins_can_manage_all_time_entries" ON time_entries;
DROP POLICY IF EXISTS "admins_can_manage_all_holiday_requests" ON holiday_requests;
DROP POLICY IF EXISTS "admins_can_manage_all_notifications" ON notifications;

-- Restore the simple working policies
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "time_entries_all_own" ON time_entries
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "holiday_requests_all_own" ON holiday_requests
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "notifications_all_own" ON notifications
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Temporarily disable RLS on users table to allow admin access
-- This is a temporary solution while we fix the proper admin policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;