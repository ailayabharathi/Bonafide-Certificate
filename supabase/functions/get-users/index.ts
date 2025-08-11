// Re-triggering deployment to resolve configuration issue. Attempt #3.
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
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !adminUser) throw new Error(userError?.message || 'Unauthorized')

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Forbidden: User is not an admin')
    }

    // 2. Fetch all users from auth.users
    const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000, // Adjust as needed
    })
    if (listUsersError) throw listUsersError

    // 3. Fetch all profiles from public.profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    if (profilesError) throw profilesError

    const profilesMap = new Map(profiles.map(p => [p.id, p]))

    // 4. Combine user and profile data
    const combinedUsers = users.map(user => {
      const userProfile = profilesMap.get(user.id)
      return {
        id: user.id,
        email: user.email,
        role: userProfile?.role || user.app_metadata?.role || 'student',
        first_name: userProfile?.first_name || null,
        last_name: userProfile?.last_name || null,
        avatar_url: userProfile?.avatar_url || null,
        department: userProfile?.department || null,
        register_number: userProfile?.register_number || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        invited_at: user.invited_at,
      }
    })

    return new Response(JSON.stringify(combinedUsers), {
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