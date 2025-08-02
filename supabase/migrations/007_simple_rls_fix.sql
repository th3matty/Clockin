-- Disable RLS temporarily to fix the issue
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Users can manage own time entries" ON time_entries;
DROP POLICY IF EXISTS "Admins can view all time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can manage own holiday requests" ON holiday_requests;
DROP POLICY IF EXISTS "Admins can manage all holiday requests" ON holiday_requests;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON notifications;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create simple policies without recursion
-- For now, we'll use a simpler approach that allows authenticated users to access their own data

-- Users table - allow users to see and update their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Time entries - users can manage their own entries
CREATE POLICY "time_entries_all_own" ON time_entries
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Holiday requests - users can manage their own requests
CREATE POLICY "holiday_requests_all_own" ON holiday_requests
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Notifications - users can manage their own notifications
CREATE POLICY "notifications_all_own" ON notifications
  FOR ALL USING (auth.uid()::text = user_id::text);

-- For admin access, we'll handle this in the application layer for now
-- This is a temporary solution to get the basic functionality working