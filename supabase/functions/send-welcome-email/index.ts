import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const displayName = name || 'Valued Customer';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'UIG Banking <noreply@unifiedinnovationsgroup.online>',
        to: [email],
        subject: 'Welcome to UIG — Your Account Has Been Created',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #e2e8f0; padding: 40px 30px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg, #d4a853, #b8942e); line-height: 56px; font-size: 28px; font-weight: bold; color: #0a0e1a;">U</div>
            </div>
            <h1 style="text-align: center; font-size: 24px; color: #ffffff; margin-bottom: 8px;">Welcome to UIG, ${displayName}!</h1>
            <p style="text-align: center; color: #94a3b8; margin-bottom: 30px;">Your account has been successfully created.</p>
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #d4a853; margin-top: 0;">What's Next?</h3>
              <ul style="color: #cbd5e1; padding-left: 20px; line-height: 1.8;">
                <li>Complete your profile with personal and financial information</li>
                <li>Submit verification documents for KYC approval</li>
                <li>Open your first checking or savings account</li>
                <li>Explore crypto and investment opportunities</li>
              </ul>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://unifiedinnovationsgroup.online/login" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #d4a853, #b8942e); color: #0a0e1a; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In to Your Account</a>
            </div>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">
              Unified Innovations Group · One Financial Plaza, New York, NY 10004<br/>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: data }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
