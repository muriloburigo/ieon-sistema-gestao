'use server'

import { createAdminClient } from '~/lib/supabase/server'
import { logAudit } from '~/lib/audit'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const isAdmin = formData.get('is_admin') === 'true'

  if (!name || !email || !password) return { error: 'Preencha todos os campos.' }

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { name },
  })

  if (error) return { error: error.message }

  if (isAdmin && data.user) {
    await supabase.from('donors').update({ is_admin: true }).eq('id', data.user.id)
  }

  await logAudit({
    action: 'create_user',
    entity: 'user',
    entityId: data.user?.id,
    entityLabel: name,
    after: { nome: name, email, admin: isAdmin ? 'Sim' : 'Não' },
  })

  revalidatePath('/admin/usuarios')
  return { error: null }
}

export async function toggleAdmin(userId: string, currentValue: boolean, userName: string) {
  const supabase = createAdminClient()
  await supabase.from('donors').update({ is_admin: !currentValue }).eq('id', userId)

  await logAudit({
    action: 'toggle_admin',
    entity: 'user',
    entityId: userId,
    entityLabel: userName,
    before: { admin: currentValue ? 'Sim' : 'Não' },
    after: { admin: !currentValue ? 'Sim' : 'Não' },
  })

  revalidatePath('/admin/usuarios')
}

export async function toggleStatus(userId: string, currentStatus: string, userName: string) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const supabase = createAdminClient()
  await supabase.from('donors').update({ status: newStatus }).eq('id', userId)

  await logAudit({
    action: 'toggle_status',
    entity: 'user',
    entityId: userId,
    entityLabel: userName,
    before: { status: currentStatus === 'active' ? 'Ativo' : 'Inativo' },
    after: { status: newStatus === 'active' ? 'Ativo' : 'Inativo' },
  })

  revalidatePath('/admin/usuarios')
}

export async function deleteUser(userId: string, userName: string, userEmail: string) {
  const supabase = createAdminClient()
  await supabase.auth.admin.deleteUser(userId)

  await logAudit({
    action: 'delete_user',
    entity: 'user',
    entityId: userId,
    entityLabel: userName,
    before: { nome: userName, email: userEmail },
  })

  revalidatePath('/admin/usuarios')
}
