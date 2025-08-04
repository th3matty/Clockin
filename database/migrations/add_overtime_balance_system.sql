-- Migration: Add Overtime Balance System
-- Description: Adds working_days_per_week and overtime_balance to users table for flexible overtime tracking
-- Date: 2025-01-08

-- Add working_days_per_week column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS working_days_per_week INTEGER DEFAULT 5;

-- Add overtime_balance column to users table  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS overtime_balance DECIMAL(6,2) DEFAULT 0.00;

-- Update existing users to have default working days per week
UPDATE users 
SET working_days_per_week = 5 
WHERE working_days_per_week IS NULL;

-- Update existing users to have default overtime balance
UPDATE users 
SET overtime_balance = 0.00 
WHERE overtime_balance IS NULL;

-- Add constraints to ensure reasonable values
ALTER TABLE users 
ADD CONSTRAINT check_working_days_per_week 
CHECK (working_days_per_week >= 1 AND working_days_per_week <= 7);

ALTER TABLE users 
ADD CONSTRAINT check_overtime_balance 
CHECK (overtime_balance >= -999.99 AND overtime_balance <= 999.99);

-- Add comments for documentation
COMMENT ON COLUMN users.working_days_per_week IS 'Number of working days per week (1-7 days, default: 5)';
COMMENT ON COLUMN users.overtime_balance IS 'Accumulated overtime balance in hours (-999.99 to +999.99, default: 0.00)';

-- Create indexes for performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_working_days_per_week ON users(working_days_per_week);
CREATE INDEX IF NOT EXISTS idx_users_overtime_balance ON users(overtime_balance) WHERE overtime_balance != 0;

-- Verify the migration
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('working_days_per_week', 'overtime_balance')
ORDER BY column_name;