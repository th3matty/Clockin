-- Create avatars bucket with the simplest possible setup
-- First, remove any existing bucket and policies
DELETE FROM storage.objects WHERE bucket_id = 'avatars';
DELETE FROM storage.buckets WHERE id = 'avatars';

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create the simplest possible policies
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT 
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update avatars" ON storage.objects
    FOR UPDATE 
    USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
    FOR DELETE 
    USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');