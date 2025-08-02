# Supabase Database Setup

This directory contains the database migrations and setup files for the ClockIn time tracker application.

## Setup Instructions

### 1. Run Database Migrations

Go to your Supabase dashboard at https://supabase.com/dashboard/project/ihivvszkpipztobheqjm

Navigate to **SQL Editor** and run the following files in order:

1. `001_initial_schema.sql` - Creates the main database tables
2. `002_rls_policies.sql` - Sets up Row Level Security policies
3. `003_functions_triggers.sql` - Creates database functions and triggers
4. `004_auth_setup.sql` - Sets up authentication helper functions
5. `005_storage_setup.sql` - Creates storage bucket for user avatars

### 2. Configure Authentication

1. Go to **Authentication > Settings** in your Supabase dashboard
2. Set **Site URL** to `http://localhost:5173` (for development)
3. Add **Redirect URLs**: `http://localhost:5173/**`
4. Enable **Email** provider
5. Optionally configure other providers (Google, GitHub, etc.)

### 3. Create Admin User

1. Go to **Authentication > Users**
2. Click **Add User**
3. Enter email and password for your admin user
4. After creation, go to **Database > Table Editor > users**
5. Find the created user and set their `role` to `'admin'`

### 4. Test Database Connection

Your application should now be able to connect to the database using the environment variables in your `.env` file:

```
VITE_SUPABASE_URL=https://ihivvszkpipztobheqjm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Database Schema Overview

### Tables Created:

- **users**: User profiles with roles and default settings
- **time_entries**: Daily time tracking entries
- **holiday_requests**: Holiday request management
- **notifications**: User notifications system

### Key Features:

- **Row Level Security**: Users can only access their own data (except admins)
- **Automatic Triggers**: Notifications created automatically for holiday requests
- **Business Logic**: Functions for calculating holidays and user roles
- **Storage**: Avatar upload functionality

## Troubleshooting

If you encounter issues:

1. Check that all migrations ran successfully without errors
2. Verify RLS policies are enabled on all tables
3. Ensure your user has the correct role set in the users table
4. Check the browser console for any authentication errors

## Next Steps

After setting up the database:

1. Test user registration and login
2. Create some sample time entries
3. Test holiday request workflow
4. Verify admin dashboard functionality