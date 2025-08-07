-- Migration: Add Reference ID to Notifications
-- Description: Adds reference_id field to link notifications to their source records
-- Date: 2025-01-08

-- Add reference_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS reference_id UUID;

-- Add comment for documentation
COMMENT ON COLUMN notifications.reference_id IS 'Reference to the source record (e.g., holiday_request.id) that triggered this notification';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_reference_id ON notifications(reference_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'reference_id';