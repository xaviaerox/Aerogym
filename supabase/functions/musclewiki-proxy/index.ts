// MuscleWiki API Proxy - Supabase Edge Function
// Runs server-side to bypass browser CORS restrictions.
// Forwards requests to api.musclewiki.com with the API key securely.
// Ready to activate once the key is upgraded to TESTING+ tier.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MUSCLEWIKI_BASE_URL = "https://api.musclewiki.com";
const API_KEY_HEADER = "X-API-Key";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-musclewiki-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Extract the target path from query param: ?path=/search&q=squat
    const targetPath = url.searchParams.get("path");
    if (!targetPath) {
      return new Response(
        JSON.stringify({ error: "Missing 'path' query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use secret from Supabase Vault (preferred) or fallback to request header
    const apiKey =
      Deno.env.get("MUSCLEWIKI_API_KEY") ||
      req.headers.get("x-musclewiki-key") ||
      "";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No MuscleWiki API key configured" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the forwarded URL, passing through all original query params except 'path'
    const forwardedParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== "path") forwardedParams.append(key, value);
    });

    const paramStr = forwardedParams.toString();
    const targetUrl = `${MUSCLEWIKI_BASE_URL}${targetPath}${paramStr ? `?${paramStr}` : ""}`;

    console.log(`[musclewiki-proxy] Forwarding: ${targetUrl}`);

    const apiResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        [API_KEY_HEADER]: apiKey,
        Accept: "application/json",
        "User-Agent": "Aerogym/1.0",
      },
    });

    // Stream the response body
    const body = await apiResponse.text();

    // Detect tier restriction
    if (apiResponse.status === 403) {
      let parsed: unknown = null;
      try { parsed = JSON.parse(body); } catch { /* ignore */ }
      return new Response(
        JSON.stringify({
          error: "API_TIER_RESTRICTED",
          message: "Tu plan MuscleWiki no permite acceso a esta ruta. Actualiza a TESTING+ en musclewiki.com.",
          details: parsed,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(body, {
      status: apiResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": apiResponse.headers.get("Content-Type") || "application/json",
        "X-MuscleWiki-Status": String(apiResponse.status),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[musclewiki-proxy] Error:", msg);
    return new Response(
      JSON.stringify({ error: "Proxy error", message: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
