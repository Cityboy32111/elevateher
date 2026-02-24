import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { invitation_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: invitation } = await supabase
      .from("company_invitations")
      .select("*, company:company_id(name), invited_by_profile:invited_by(full_name)")
      .eq("id", invitation_id)
      .single();

    if (!invitation) {
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appUrl = Deno.env.get("APP_URL") || "https://app.elevateher.io";
    const inviteUrl = `${appUrl}/accept-invite?token=${invitation.token}`;

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
          to: invitation.email,
          subject: `You've been invited to elevateHer by ${invitation.company?.name || "your company"}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6b21a8;">You're invited to elevateHer</h2>
              <p>${invitation.company?.name || "Your company"} has invited you to join elevateHer, a support platform designed for mothers navigating the return to work journey.</p>
              <p>elevateHer gives you access to licensed therapists, a structured year-long support program, career tools, and a community of women in similar situations.</p>
              <a href="${inviteUrl}" style="display: inline-block; background: #6b21a8; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Accept Invitation</a>
              <p style="color: #666; font-size: 14px;">This invitation expires in 7 days. If you have questions, contact your HR administrator.</p>
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
