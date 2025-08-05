# Security Migration Instructions

## Overview
This migration implements task 9.2 - Security and Storage Optimization by making the avatars bucket private and adding proper Row Level Security (RLS) policies.

## What This Migration Does

1. **Makes Avatars Bucket Private**: Changes the bucket from public to private access
2. **Implements Secure RLS Policies**: Users can only access their own avatars
3. **Updates File Path Storage**: Stores file paths instead of public URLs
4. **Adds Signed URL Generation**: Creates secure, time-limited URLs for avatar access

## Security Improvements

### Before (Insecure)
- ❌ Avatars bucket was public - anyone could access any avatar
- ❌ Permissive policies allowed any authenticated user to access/modify any avatar
- ❌ No user-specific access control

### After (Secure)
- ✅ Avatars bucket is private - requires authentication
- ✅ RLS policies ensure users can only access their own avatars
- ✅ File paths stored in database, signed URLs generated on demand
- ✅ Time-limited access with automatic expiration

## How to Apply

### 1. Run the Database Migration
Execute the SQL migration file in your Supabase dashboard or via CLI:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL file:
# database/migrations/011_secure_avatars_bucket.sql
```

### 2. Update Application Code
The following components have been updated to use secure avatars:

- `src/composables/useSecureAvatars.ts` - New composable for signed URL generation
- `src/components/shared/SecureAvatar.vue` - New secure avatar component
- `src/components/shared/AvatarUpload.vue` - Updated to use secure avatars
- `src/components/shared/UserProfileDropdown.vue` - Updated to use secure avatars
- `src/composables/useUserSettings.ts` - Updated to store file paths instead of URLs

### 3. Verify Security

After applying the migration, verify that:

1. **Bucket is Private**: Try accessing an avatar URL directly - it should fail
2. **RLS Works**: Users can only see their own avatars
3. **Signed URLs Work**: Avatars display correctly in the application
4. **Upload Works**: New avatar uploads work with the private bucket

## File Structure Changes

### Avatar File Paths
Avatars are now stored with the following structure:
```
avatars/
  ├── {user_id}/
  │   ├── {timestamp}.jpg
  │   ├── {timestamp}.png
  │   └── ...
```

### Database Changes
- `users.avatar_url` now stores file paths (e.g., "user123/1640995200000.jpg")
- Previously stored full public URLs

## Rollback Instructions

If you need to rollback this migration:

1. **Revert Database Changes**:
```sql
-- Make bucket public again
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- Remove secure policies
DROP POLICY IF EXISTS "Users can view own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Restore permissive policies
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
-- ... (restore other permissive policies)
```

2. **Revert Code Changes**: Restore the previous versions of the updated files

## Testing Checklist

- [ ] Avatar upload works for new users
- [ ] Avatar display works for existing users
- [ ] Avatar removal works correctly
- [ ] Users cannot access other users' avatars
- [ ] Signed URLs expire correctly
- [ ] Performance is acceptable with URL caching

## Security Benefits

1. **Privacy**: Users' avatars are now private by default
2. **Access Control**: Proper user-specific access control
3. **Audit Trail**: Better tracking of avatar access
4. **Scalability**: Signed URLs reduce server load
5. **Compliance**: Better data privacy compliance