import { createClient, createAdminClient } from '~/lib/supabase/server'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const db = createAdminClient()
  const { data: donors } = await db
    .from('donors')
    .select('id, name, email, is_admin, status, created_at')
    .order('created_at', { ascending: false })

  return <UsuariosClient users={donors ?? []} currentUserId={user?.id ?? ''} />
}
