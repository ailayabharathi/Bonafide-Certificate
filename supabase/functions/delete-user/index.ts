import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function createAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are not set.')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient()

    // 1. Verify admin making the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !adminUser) {
      throw new Error(userError?.message || 'Unauthorized')
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Forbidden: User is not an admin')
    }

    // 2. Get user ID to delete from request body
    const { userIdToDelete } = await req.json()
    if (!userIdToDelete) {
      throw new Error("User ID to delete is required.")
    }

    // 3. Prevent admin from deleting themselves
    if (adminUser.id === userIdToDelete) {
        throw new Error("Admins cannot delete their own account.")
    }

    // 4. Delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete)

    if (deleteError) {
      // The user might have associated data that prevents deletion.
      // A common one is storage objects. Let's try to clean those up.
      if (deleteError.message.includes('violates row-level security policy') || deleteError.message.includes('referenced')) {
         // Attempt to delete user's storage objects first
         const { data: files, error: listError } = await supabaseAdmin.storage.from('avatars').list(userIdToDelete)
         if (listError) {
            console.error(`Could not list files for user ${userIdToDelete}:`, listError.message)
         } else if (files && files.length > 0) {
            const filePaths = files.map(file => `${userIdToDelete}/${file.name}`)
            await supabaseAdmin.storage.from('avatars').remove(filePaths)
         }
         // Retry deletion
         const { error: retryDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete)
         if (retryDeleteError) {
            throw new Error(`Failed to delete user after cleanup: ${retryDeleteError.message}`)
         }
      } else {
        throw new Error(deleteError.message)
      }
    }

    return new Response(JSON.stringify({ message: "User deleted successfully." }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})