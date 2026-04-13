import { createAdminClient } from '~/lib/supabase/server'
import AssinaturasClient from './AssinaturasClient'

export default async function AssinaturasPage() {
  const supabase = createAdminClient()

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, donors!inner(*), payments(*)')
    .eq('donors.is_admin', false)
    .order('joined_at', { ascending: false })

  return <AssinaturasClient subscriptions={subscriptions ?? []} />
}
