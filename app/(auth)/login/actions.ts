'use server'

import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(email: string, password: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return 'Email ou senha incorretos.'

  const adminClient = createAdminClient()
  const { data: donor, error: donorError } = await adminClient
    .from('donors')
    .select('is_admin')
    .eq('id', data.user.id)
    .single()

  console.log('[LOGIN] user.id:', data.user.id)
  console.log('[LOGIN] donor:', donor)
  console.log('[LOGIN] donorError:', donorError)

  redirect(donor?.is_admin ? '/admin/dashboard' : '/dashboard')
}
