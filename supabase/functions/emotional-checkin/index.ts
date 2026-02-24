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
    const { feeling, intensity, context } = await req.json();

    const systemMessage = {
      role: "system",
      content: `You are a compassionate emotional wellness guide for working mothers. When a user shares how they're feeling, you:
1. Validate their emotion warmly (2-3 sentences)
2. Provide 2-3 specific, actionable exercises they can do right now
3. Gently suggest when professional support might be helpful
Never dismiss feelings. Never say "just" (as in "just relax").
Return JSON: { "acknowledgment": "...", "exercises": [{"title": "...", "steps": ["..."]}], "resources": ["..."] }`,
    };

    const userMessage = {
      role: "user",
      content: `I'm feeling ${feeling} at intensity ${intensity}/10.${context ? ` Context: ${context}` : ""}`,
    };

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMessage, userMessage],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
