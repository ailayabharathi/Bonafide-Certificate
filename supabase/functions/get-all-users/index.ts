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

    // 2. Get all users from Auth
    const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000, // Adjust as needed
    })
    if (listUsersError) throw listUsersError

    // 3. Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    if (profilesError) throw profilesError

    // 4. Merge users and profiles
    const profilesMap = new Map(profiles.map(p => [p.id, p]))
    
    const mergedUsers = users.map(user => {
      const profile = profilesMap.get(user.id)
      return {
        ...user, // Auth user data
        ...profile, // Profile data (overwrites id, email, etc. from auth if present, which is fine)
        id: user.id, // Ensure auth user id is primary
        email: user.email, // Ensure auth email is primary
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