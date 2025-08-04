-- Rollback Migration: Remove Overtime Tracking Support
-- Description: Removes overtime tracking columns if needed
-- Date: 2025-01-08
-- WARNING: This will permanently delete overtime data!

-- Remove constraints first
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_weekly_target_hours;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS check_overtime_hours;

-- Remove indexes
DROP INDEX IF EXISTS idx_users_weekly_target_hours;
DROP INDEX IF EXISTS idx_time_entries_overtime_hours;

-- Remove columns (WARNING: This will delete data!)
ALTER TABLE users DROP COLUMN IF EXISTS weekly_target_hours;
ALTER TABLE time_entries DROP COLUMN IF EXISTS overtime_hours;

-- Verify rollback
SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_name IN ('users', 'time_entries')
AND column_name IN ('weekly_target_hours', 'overtime_hours');