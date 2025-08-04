# Database Migration: Overtime Tracking Support

## Overview
This migration adds overtime tracking functionality to the employee time tracker system.

## Changes Made
- Added `weekly_target_hours` column to `users` table (default: 40.00)
- Added `overtime_hours` column to `time_entries` table (default: 0.00)
- Added constraints to ensure reasonable values
- Added indexes for performance optimization

## How to Apply Migration

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `add_overtime_tracking.sql`
4. Execute the migration

### Using Supabase CLI
```bash
supabase db push
```

### Manual SQL Execution
```sql
-- Execute the contents of add_overtime_tracking.sql in your database
```

## Verification
After running the migration, verify the changes:

```sql
-- Check that new columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name IN ('users', 'time_entries') 
AND column_name IN ('weekly_target_hours', 'overtime_hours');

-- Check that constraints are in place
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_name IN ('check_weekly_target_hours', 'check_overtime_hours');
```

## Rollback
If you need to rollback this migration:
1. **WARNING**: This will permanently delete overtime data!
2. Execute the contents of `rollback_overtime_tracking.sql`

## Data Impact
- All existing users will have `weekly_target_hours` set to 40.00
- All existing time entries will have `overtime_hours` set to 0.00
- No existing data will be lost or modified

## Next Steps
After applying this migration:
1. Update your application code to use the new fields
2. Test the overtime calculation functionality
3. Update user documentation about overtime tracking