-- Check if users table and policies are working correctly
-- This is a diagnostic query to see if there are any issues

-- Check if the users table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if RLS is enabled on users table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Check existing policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Test if we can select from users table (this should work for authenticated users)
-- SELECT id, email, full_name, role FROM users LIMIT 1;