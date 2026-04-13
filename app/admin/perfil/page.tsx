import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '~/components/ProfileForm'

export default async function AdminPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()
  const { data: donor } = await db
    .from('donors')
    .select('name, email, whatsapp, cpf, is_admin')
    .eq('id', user.id)
    .single()

  if (!donor?.is_admin) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meu perfil</h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie suas informações pessoais e senha.</p>
      </div>

      <ProfileForm
        name={donor.name}
        email={donor.email}
        whatsapp={donor.whatsapp}
        cpf={donor.cpf}
        isAdmin
      />
    </div>
  )
}
