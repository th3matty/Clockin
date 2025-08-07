-- Migration: Update Notification Triggers to Include Reference ID
-- Description: Updates database triggers to include reference_id for proper cleanup
-- Date: 2025-01-08

-- Update the function to notify admins of new holiday requests
CREATE OR REPLACE FUNCTION notify_admins_new_holiday_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  requester_name TEXT;
BEGIN
  -- Get the requester's name
  SELECT full_name INTO requester_name FROM users WHERE id = NEW.user_id;
  
  -- Create notification for all admins with reference_id
  FOR admin_record IN SELECT id FROM users WHERE role = 'admin' LOOP
    INSERT INTO notifications (user_id, type, title, message, reference_id)
    VALUES (
      admin_record.id,
      'holiday_request',
      'New Holiday Request',
      requester_name || ' has requested ' || NEW.days_requested || ' days of holiday from ' || 
      NEW.start_date || ' to ' || NEW.end_date || '.',
      NEW.id  -- Include the holiday request ID as reference
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the function to notify about holiday status changes
CREATE OR REPLACE FUNCTION notify_holiday_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status actually changed
  IF OLD.status != NEW.status THEN
    -- Notify the requester about status change
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (user_id, type, title, message, reference_id)
      VALUES (
        NEW.user_id,
        'holiday_approved',
        'Holiday Request Approved',
        'Your holiday request for ' || NEW.start_date || ' to ' || NEW.end_date || ' has been approved.',
        NEW.id
      );
    ELSIF NEW.status = 'denied' THEN
      INSERT INTO notifications (user_id, type, title, message, reference_id)
      VALUES (
        NEW.user_id,
        'holiday_denied',
        'Holiday Request Denied',
        'Your holiday request for ' || NEW.start_date || ' to ' || NEW.end_date || ' has been denied.' ||
        CASE WHEN NEW.admin_notes IS NOT NULL THEN ' Reason: ' || NEW.admin_notes ELSE '' END,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the functions were updated
SELECT proname, prosrc FROM pg_proc WHERE proname IN ('notify_admins_new_holiday_request', 'notify_holiday_status_change');