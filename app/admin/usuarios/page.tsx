import { createAdminClient } from '~/lib/supabase/server'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = createAdminClient()

  const { data: donors } = await supabase
    .from('donors')
    .select('id, name, email, is_admin, created_at')
    .order('created_at', { ascending: false })

  return <UsuariosClient users={donors ?? []} />
}
