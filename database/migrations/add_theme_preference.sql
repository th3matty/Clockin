-- Add theme preference column to users table
-- This allows users to store their preferred theme (light, dark, system)

-- Add theme_preference column
ALTER TABLE users 
ADD COLUMN theme_preference TEXT DEFAULT 'system' 
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Add comment for documentation
COMMENT ON COLUMN users.theme_preference IS 'User preferred theme: light, dark, or system';

-- Create index for potential future queries (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_users_theme_preference ON users(theme_preference);