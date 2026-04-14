import { createAdminClient } from '~/lib/supabase/server'
import AlunosClient from './AlunosClient'

export default async function AlunosPage() {
  const supabase = createAdminClient()

  const { data: donors } = await supabase
    .from('donors')
    .select('*, subscriptions(*)')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })

  // PostgREST returns subscriptions as a single object (not array) due to UNIQUE(donor_id).
  // Normalize to always be an array before passing to the client component.
  const normalized = (donors ?? []).map(d => ({
    ...d,
    subscriptions: !d.subscriptions ? [] : Array.isArray(d.subscriptions) ? d.subscriptions : [d.subscriptions],
  }))

  return <AlunosClient donors={normalized} />
}
