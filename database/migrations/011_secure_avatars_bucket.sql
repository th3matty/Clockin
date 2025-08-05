-- Security and Storage Optimization: Make avatars bucket private with proper RLS
-- This migration addresses task 9.2 requirements

-- Step 1: Remove existing permissive policies
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- Step 2: Update bucket to be private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';

-- Step 3: Create secure RLS policies - users can only access their own avatars

-- Policy for viewing avatars: Users can only view their own avatars
CREATE POLICY "Users can view own avatars" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy for uploading avatars: Users can only upload to their own folder
CREATE POLICY "Users can upload own avatars" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy for updating avatars: Users can only update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy for deleting avatars: Users can only delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Step 4: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 5: Add comment for documentation
COMMENT ON TABLE storage.objects IS 'Storage objects with RLS enabled for secure avatar access';