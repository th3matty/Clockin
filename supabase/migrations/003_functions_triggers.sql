-- Function to handle user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create notification when holiday request status changes
CREATE OR REPLACE FUNCTION notify_holiday_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'holiday_approved'
        WHEN NEW.status = 'denied' THEN 'holiday_denied'
        ELSE 'holiday_request'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Holiday Request Approved'
        WHEN NEW.status = 'denied' THEN 'Holiday Request Denied'
        ELSE 'Holiday Request Updated'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 
          'Your holiday request from ' || NEW.start_date || ' to ' || NEW.end_date || ' has been approved.'
        WHEN NEW.status = 'denied' THEN 
          'Your holiday request from ' || NEW.start_date || ' to ' || NEW.end_date || ' has been denied.'
        ELSE 
          'Your holiday request status has been updated.'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for holiday request status changes
CREATE OR REPLACE TRIGGER on_holiday_status_change
  AFTER UPDATE ON holiday_requests
  FOR EACH ROW EXECUTE FUNCTION notify_holiday_status_change();

-- Function to notify admins of new holiday requests
CREATE OR REPLACE FUNCTION notify_admins_new_holiday_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  requester_name TEXT;
BEGIN
  -- Get the requester's name
  SELECT full_name INTO requester_name FROM users WHERE id = NEW.user_id;
  
  -- Create notification for all admins
  FOR admin_record IN SELECT id FROM users WHERE role = 'admin' LOOP
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      admin_record.id,
      'holiday_request',
      'New Holiday Request',
      requester_name || ' has requested ' || NEW.days_requested || ' days of holiday from ' || 
      NEW.start_date || ' to ' || NEW.end_date || '.'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new holiday requests
CREATE OR REPLACE TRIGGER on_new_holiday_request
  AFTER INSERT ON holiday_requests
  FOR EACH ROW EXECUTE FUNCTION notify_admins_new_holiday_request();

-- Function to calculate business days between two dates
CREATE OR REPLACE FUNCTION calculate_business_days(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
DECLARE
  days INTEGER := 0;
  iter_date DATE := start_date;
BEGIN
  WHILE iter_date <= end_date LOOP
    -- Count only weekdays (Monday = 1, Sunday = 0)
    IF EXTRACT(DOW FROM iter_date) BETWEEN 1 AND 5 THEN
      days := days + 1;
    END IF;
    iter_date := iter_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN days;
END;
$$ LANGUAGE plpgsql;