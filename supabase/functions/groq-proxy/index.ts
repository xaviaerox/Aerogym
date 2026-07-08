// Supabase Edge Function: groq-proxy
// La API key de Groq vive en el vault de Supabase, NUNCA en el cliente.
// Se configura con: supabase secrets set GROQ_API_KEY=tu_clave

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

serve(async (req) => {
  const origin = req.headers.get('origin') || '';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }

  // Leer el secret DENTRO del handler (no a nivel de módulo)
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment');
    return new Response(JSON.stringify({ error: 'Groq API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verificar que el request viene de un usuario autenticado
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { model = 'llama-3.3-70b-versatile', messages, max_tokens, temperature } = body;

    // Validar el payload
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request: messages array required' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    console.log(`Calling Groq with model=${model}, messages=${messages.length}`);

    // Llamar a la API de Groq (compatible con OpenAI)
    const groqResponse = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: max_tokens ?? 1024,
        temperature: temperature ?? 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('Groq API error:', JSON.stringify(errorData));
      return new Response(JSON.stringify({ error: 'Groq API error', details: errorData }), {
        status: groqResponse.status,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    const data = await groqResponse.json();
    console.log('Groq response OK');
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', String(err));
    return new Response(JSON.stringify({ error: 'Internal server error', detail: String(err) }), {
      status: 500,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});
