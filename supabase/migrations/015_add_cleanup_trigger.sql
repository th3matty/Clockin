-- Migration: Add Cleanup Trigger for Holiday Request Notifications
-- Description: Automatically clean up related notifications when holiday requests are deleted
-- Date: 2025-01-08

-- Function to clean up notifications when holiday request is deleted
CREATE OR REPLACE FUNCTION cleanup_holiday_request_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all unread notifications related to this holiday request
  DELETE FROM notifications 
  WHERE reference_id = OLD.id 
  AND read = false;
  
  -- Log the cleanup (optional, for debugging)
  RAISE NOTICE 'Cleaned up notifications for deleted holiday request: %', OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up notifications when holiday request is deleted
CREATE OR REPLACE TRIGGER on_holiday_request_delete
  BEFORE DELETE ON holiday_requests
  FOR EACH ROW EXECUTE FUNCTION cleanup_holiday_request_notifications();

-- Verify the trigger was created
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'on_holiday_request_delete';