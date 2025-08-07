// Utility function to test storage connectivity
import { supabase } from './supabase'

export async function testStorageConnection() {
  
  try {
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError)
      return false
    }
    
    
    // Test 2: Check if avatars bucket exists
    const avatarsBucket = buckets?.find(b => b.name === 'avatars')
    if (!avatarsBucket) {
      console.error('❌ Avatars bucket not found')
      return false
    }
    
    // Test 3: Try to list files in avatars bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 })
    
    if (filesError) {
      console.error('❌ Failed to list files in avatars bucket:', filesError)
      return false
    }
    
    
    // Test 4: Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return false
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Storage test failed with exception:', error)
    return false
  }
}

// Function to create a test upload
export async function testAvatarUpload() {
  try {
    // Create a small test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 1, 1)
    }
    
    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png')
    })
    
    const testFile = new File([blob], 'test.png', { type: 'image/png' })
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ No authenticated user')
      return false
    }
    
    // Try upload
    const fileName = `${user.id}/test-${Date.now()}.png`
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('❌ Test upload failed:', error)
      return false
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path)
    
    // Clean up test file
    await supabase.storage.from('avatars').remove([data.path])
    return true
    
  } catch (error) {
    console.error('❌ Test upload failed with exception:', error)
    return false
  }
}