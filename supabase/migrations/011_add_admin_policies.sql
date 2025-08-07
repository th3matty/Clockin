-- Migration: Add Admin Access Policies
-- Description: Adds RLS policies to allow admins to access all user data
-- Date: 2025-01-08

-- Add admin policies for users table
CREATE POLICY "admins_can_view_all_users" ON users
  FOR SELECT USING (
    -- Allow if user is viewing their own data OR if user is an admin
    auth.uid()::text = id::text OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Drop the old restrictive policy and replace it
DROP POLICY IF EXISTS "users_select_own" ON users;

-- Add admin policies for time_entries table
CREATE POLICY "admins_can_view_all_time_entries" ON time_entries
  FOR SELECT USING (
    -- Allow if user owns the entry OR if user is an admin
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Keep the existing policy for users to manage their own entries
-- But add admin access for all operations
CREATE POLICY "admins_can_manage_all_time_entries" ON time_entries
  FOR ALL USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Drop the old restrictive policy and replace it
DROP POLICY IF EXISTS "time_entries_all_own" ON time_entries;

-- Add admin policies for holiday_requests table
CREATE POLICY "admins_can_manage_all_holiday_requests" ON holiday_requests
  FOR ALL USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Drop the old restrictive policy and replace it
DROP POLICY IF EXISTS "holiday_requests_all_own" ON holiday_requests;

-- Add admin policies for notifications table
CREATE POLICY "admins_can_manage_all_notifications" ON notifications
  FOR ALL USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Drop the old restrictive policy and replace it
DROP POLICY IF EXISTS "notifications_all_own" ON notifications;

-- Verify the policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('users', 'time_entries', 'holiday_requests', 'notifications')
ORDER BY tablename, policyname;