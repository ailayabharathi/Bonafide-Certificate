import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// IMPORTANT: You must set this secret in your Supabase project settings
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { requestId } = await req.json()
    if (!requestId) {
      throw new Error("Request ID is required.")
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get request and profile data
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('bonafide_requests')
      .select('*, profiles(first_name, last_name, email)')
      .eq('id', requestId)
      .single()

    if (requestError) throw requestError
    if (!requestData) throw new Error("Request not found.")
    if (!requestData.profiles?.email) throw new Error("Student email not found.")

    const { status, rejection_reason, user_id } = requestData;
    const { first_name, email } = requestData.profiles;

    let subject = '';
    let body = '';
    let notificationMessage = '';
    let notificationLink = '/student/dashboard';

    switch (status) {
      case 'approved_by_tutor':
        subject = 'Request Approved by Tutor';
        body = `Hi ${first_name},<br><br>Good news! Your bonafide certificate request has been approved by your tutor and is now with the HOD for further approval.<br><br>You can track its status on your dashboard.`;
        notificationMessage = 'Your request was approved by your tutor.';
        break;
      case 'rejected_by_tutor':
        subject = 'Update on Your Bonafide Request';
        body = `Hi ${first_name},<br><br>Your bonafide certificate request has been rejected by your tutor. <br>Reason: ${rejection_reason}.<br><br>Please log in to your dashboard to edit and resubmit your request.`;
        notificationMessage = `Your request was rejected by your tutor. Reason: ${rejection_reason}`;
        break;
      case 'approved_by_hod':
        subject = 'Request Approved by HOD';
        body = `Hi ${first_name},<br><br>Your bonafide certificate request has been approved by the HOD. It is now being processed by the college office.<br><br>You will be notified once the certificate is ready.`;
        notificationMessage = 'Your request was approved by the HOD.';
        break;
      case 'rejected_by_hod':
        subject = 'Update on Your Bonafide Request';
        body = `Hi ${first_name},<br><br>Your bonafide certificate request has been rejected by the HOD. <br>Reason: ${rejection_reason}.<br><br>Please log in to your dashboard to edit and resubmit your request.`;
        notificationMessage = `Your request was rejected by the HOD. Reason: ${rejection_reason}`;
        break;
      case 'completed':
        subject = 'Your Bonafide Certificate is Ready!';
        body = `Hi ${first_name},<br><br>Your bonafide certificate is now ready! You can view and download it from your dashboard.<br><br>Thank you.`;
        notificationMessage = 'Your certificate is ready for download!';
        notificationLink = `/certificate/${requestId}`;
        break;
      default:
        // Don't send email or notification for 'pending' or other statuses
        return new Response(JSON.stringify({ message: "No notification needed for this status." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
    }

    // Create in-app notification
    if (notificationMessage) {
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: user_id,
          message: notificationMessage,
          link: notificationLink,
        });
      if (notificationError) {
        // Log this error but don't fail the whole function
        console.error('Error creating notification:', notificationError);
      }
    }

    // Using Resend as an example email provider
    const resendPayload = {
      from: 'Adhiyamaan College <noreply@yourdomain.com>', // IMPORTANT: Update with your verified domain
      to: [email],
      subject: subject,
      html: body,
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendPayload),
    });

    if (!res.ok) {
      const errorBody = await res.json();
      console.error("Resend API Error:", errorBody);
      throw new Error(`Failed to send email: ${errorBody.message}`);
    }

    return new Response(JSON.stringify({ message: "Email and notification sent successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Edge function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})