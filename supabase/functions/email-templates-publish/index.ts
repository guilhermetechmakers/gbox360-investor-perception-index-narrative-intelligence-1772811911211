/**
 * Publish email template - Supabase Edge Function
 * POST: Update template content/version (admin only)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const id = body?.id ?? ''
    const subject = body?.subject
    const bodyHtml = body?.bodyHtml ?? body?.body_html
    const bodyText = body?.bodyText ?? body?.body_text

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Template id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    }
    if (subject !== undefined) updates.subject = subject
    if (bodyHtml !== undefined) updates.body_html = bodyHtml
    if (bodyText !== undefined) updates.body_text = bodyText
    if (Object.keys(updates).length > 2) {
      const { data: existing } = await supabase
        .from('email_templates')
        .select('version')
        .eq('id', id)
        .single()
      if (existing) {
        updates.version = (existing.version ?? 1) + 1
      }
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const template = data
      ? {
          id: data.id,
          name: data.name,
          subject: data.subject,
          bodyHtml: data.body_html,
          bodyText: data.body_text ?? '',
          version: data.version ?? 1,
          lastUpdatedAt: data.last_updated_at ?? data.updated_at,
          active: data.active ?? true,
          providerTemplateId: data.provider_template_id,
        }
      : null

    return new Response(
      JSON.stringify(template),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
