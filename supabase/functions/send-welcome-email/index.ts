import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, company_name, admin_name } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "elevateHer <no-reply@elevateher.com>",
          to: email,
          subject: "Welcome to elevateHer!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6b21a8;">Welcome to elevateHer, ${admin_name}!</h2>
              <p>Your company account for <strong>${company_name}</strong> has been created successfully.</p>
              <p>Here's what you can do next:</p>
              <ul>
                <li>Set up your company branding</li>
                <li>Invite employees to the platform</li>
                <li>Configure your support programs</li>
                <li>Explore the analytics dashboard</li>
              </ul>
              <a href="${Deno.env.get("APP_URL") || "https://app.elevateher.io"}/dashboard" style="display: inline-block; background: #6b21a8; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Go to Dashboard</a>
              <p style="color: #666; font-size: 14px;">If you have questions, contact us at support@elevateher.com</p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
