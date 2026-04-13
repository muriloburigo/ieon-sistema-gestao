'use server'

import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(email: string, password: string, captchaToken?: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  })
  if (error || !data.user) return 'Email ou senha incorretos.'

  const adminClient = createAdminClient()
  const { data: donor } = await adminClient
    .from('donors')
    .select('is_admin')
    .eq('id', data.user.id)
    .single()

  redirect(donor?.is_admin ? '/admin/dashboard' : '/dashboard')
}
