-- Migration: Add Overtime Tracking Support
-- Description: Adds weekly_target_hours to users table and overtime_hours to time_entries table
-- Date: 2025-01-08

-- Add weekly_target_hours column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weekly_target_hours DECIMAL(4,2) DEFAULT 40.00;

-- Add overtime_hours column to time_entries table  
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(4,2) DEFAULT 0.00;

-- Update existing users to have default weekly target hours
UPDATE users 
SET weekly_target_hours = 40.00 
WHERE weekly_target_hours IS NULL;

-- Update existing time entries to have default overtime hours
UPDATE time_entries 
SET overtime_hours = 0.00 
WHERE overtime_hours IS NULL;

-- Add constraints to ensure reasonable values
ALTER TABLE users 
ADD CONSTRAINT check_weekly_target_hours 
CHECK (weekly_target_hours >= 20.00 AND weekly_target_hours <= 60.00);

ALTER TABLE time_entries 
ADD CONSTRAINT check_overtime_hours 
CHECK (overtime_hours >= 0.00 AND overtime_hours <= 12.00);

-- Add comments for documentation
COMMENT ON COLUMN users.weekly_target_hours IS 'Target weekly working hours for overtime calculation (default: 40.00)';
COMMENT ON COLUMN time_entries.overtime_hours IS 'Additional overtime hours worked beyond regular schedule (default: 0.00)';

-- Create indexes for performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_weekly_target_hours ON users(weekly_target_hours);
CREATE INDEX IF NOT EXISTS idx_time_entries_overtime_hours ON time_entries(overtime_hours) WHERE overtime_hours > 0;

-- Verify the migration
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'weekly_target_hours'

UNION ALL

SELECT 
    'time_entries' as table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'time_entries' 
AND column_name = 'overtime_hours';