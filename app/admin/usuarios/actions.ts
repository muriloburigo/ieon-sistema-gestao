'use server'

import { createAdminClient } from '~/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const isAdmin = formData.get('is_admin') === 'true'

  if (!name || !email || !password) return { error: 'Preencha todos os campos.' }

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) return { error: error.message }

  if (isAdmin && data.user) {
    await supabase.from('donors').update({ is_admin: true }).eq('id', data.user.id)
  }

  revalidatePath('/admin/usuarios')
  return { error: null }
}

export async function toggleAdmin(userId: string, currentValue: boolean) {
  const supabase = createAdminClient()
  await supabase.from('donors').update({ is_admin: !currentValue }).eq('id', userId)
  revalidatePath('/admin/usuarios')
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient()
  await supabase.auth.admin.deleteUser(userId)
  revalidatePath('/admin/usuarios')
}
