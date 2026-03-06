/**
 * Shared CORS headers for Supabase Edge Functions.
 * Every Edge Function must handle OPTIONS preflight and include these headers on responses.
 * Pass Authorization through to Supabase client for RLS/auth.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}
