import { createAdminClient } from '~/lib/supabase/server'
import AlunosClient from './AlunosClient'

export default async function AlunosPage() {
  const supabase = createAdminClient()

  const { data: donors } = await supabase
    .from('donors')
    .select('*, subscriptions(*)')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })

  return <AlunosClient donors={donors ?? []} />
}
