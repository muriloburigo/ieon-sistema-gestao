'use server'

import { createClient, createAdminClient } from '~/lib/supabase/server'
import { logAudit } from '~/lib/audit'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  name: string
  whatsapp: string
  cpf: string
}): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Não autenticado.'

  const db = createAdminClient()

  const { data: before } = await db
    .from('donors')
    .select('name, whatsapp, cpf, is_admin')
    .eq('id', user.id)
    .single()

  const updates = {
    name: data.name.trim(),
    whatsapp: data.whatsapp.replace(/\D/g, '') || null,
    cpf: data.cpf.replace(/\D/g, '') || null,
  }

  const { error } = await db.from('donors').update(updates).eq('id', user.id)
  if (error) return 'Erro ao salvar. Tente novamente.'

  // Audit log only for admin users editing their own profile
  if (before?.is_admin) {
    await logAudit({
      action: 'edit_own_profile',
      entity: 'donor',
      entityId: user.id,
      entityLabel: before.name,
      before: { nome: before.name, whatsapp: before.whatsapp, cpf: before.cpf },
      after: updates,
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/perfil')
  revalidatePath('/admin/perfil')
  return null
}

export async function changePassword(newPassword: string): Promise<string | null> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return 'Não foi possível alterar a senha. Tente novamente.'
  return null
}
