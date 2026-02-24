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
    const { session_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: session } = await supabase
      .from("coaching_sessions")
      .select("*, coach:coach_id(full_name, email), mom:mom_id(full_name, email)")
      .eq("id", session_id)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      // Send email to coach
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "elevateHer <notifications@elevateher.io>",
          to: session.coach?.email,
          subject: "New Coaching Session Booked",
          html: `<h2>New session booked</h2><p>${session.mom?.full_name} has booked a session with you.</p><p><strong>Date:</strong> ${new Date(session.scheduled_at).toLocaleString()}</p><p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>`,
        }),
      });

      // Send email to employee
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "elevateHer <notifications@elevateher.io>",
          to: session.mom?.email,
          subject: "Coaching Session Confirmed",
          html: `<h2>Session Confirmed!</h2><p>Your coaching session with ${session.coach?.full_name} is confirmed.</p><p><strong>Date:</strong> ${new Date(session.scheduled_at).toLocaleString()}</p>`,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
