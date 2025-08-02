-- Drop existing policies to fix recursion issue
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Only admins can insert users" ON users;

-- Recreate users policies without recursion
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id::text = u.id::text 
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id::text = u.id::text 
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Fix time entries policies
DROP POLICY IF EXISTS "Time entries access" ON time_entries;

CREATE POLICY "Users can manage own time entries" ON time_entries
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all time entries" ON time_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id::text = u.id::text 
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Fix holiday requests policies
DROP POLICY IF EXISTS "Holiday requests access" ON holiday_requests;

CREATE POLICY "Users can manage own holiday requests" ON holiday_requests
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all holiday requests" ON holiday_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id::text = u.id::text 
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Notifications policies are fine as they don't have recursion
-- But let's recreate them for consistency
DROP POLICY IF EXISTS "Notifications access" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can create notifications for any user" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id::text = u.id::text 
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );