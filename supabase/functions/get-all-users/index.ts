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

    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()

    if (profileError || adminProfile?.role !== 'admin') {
      throw new Error('Forbidden: User is not an admin')
    }

    // 2. Get all users from Auth and Profiles
    const { data: { users: authUsers }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    if (listUsersError) throw listUsersError

    const { data: profiles, error: profilesError } = await supabaseAdmin.from('profiles').select('*')
    if (profilesError) throw profilesError

    // 3. Merge the data
    const profilesMap = new Map(profiles.map(p => [p.id, p]))
    
    const mergedUsers = authUsers.map(authUser => {
      const profile = profilesMap.get(authUser.id)
      return {
        ...profile, // Spread profile data first
        id: authUser.id,
        email: authUser.email,
        role: authUser.app_metadata?.role || profile?.role || 'student', // Prioritize auth metadata role
        last_sign_in_at: authUser.last_sign_in_at,
        status: authUser.last_sign_in_at ? 'Active' : 'Invited',
        // Ensure profile fields are not overwritten by undefined authUser fields
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        avatar_url: profile?.avatar_url || null,
        department: profile?.department || null,
        register_number: profile?.register_number || null,
      }
    })

    return new Response(JSON.stringify(mergedUsers), {
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