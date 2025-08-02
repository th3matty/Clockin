-- Insert sample admin user (you'll need to create this user through Supabase Auth first)
-- This is just a placeholder - actual user creation happens through the auth system

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  RETURN COALESCE(user_role, 'employee');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get remaining holidays for a user
CREATE OR REPLACE FUNCTION get_remaining_holidays(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_allowance INTEGER;
  used_holidays INTEGER;
BEGIN
  -- Get user's holiday allowance
  SELECT holiday_allowance INTO total_allowance 
  FROM users WHERE id = user_id;
  
  -- Calculate used holidays (approved requests only)
  SELECT COALESCE(SUM(days_requested), 0) INTO used_holidays
  FROM holiday_requests 
  WHERE user_id = get_remaining_holidays.user_id 
    AND status = 'approved'
    AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  RETURN COALESCE(total_allowance, 25) - COALESCE(used_holidays, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;