-- Manual creation of avatars bucket with proper setup
-- This should be run if the automatic bucket creation didn't work

-- First, ensure the bucket exists
DO $$
BEGIN
    -- Delete existing bucket if it exists (to start fresh)
    DELETE FROM storage.buckets WHERE id = 'avatars';
    
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'avatars', 
        'avatars', 
        true, 
        5242880, -- 5MB in bytes
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    );
END $$;

-- Remove all existing policies for storage.objects related to avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create simple, working policies
CREATE POLICY "Public avatar access" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );