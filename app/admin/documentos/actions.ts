'use server'

import { createAdminClient } from '~/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const file = formData.get('file') as File

  if (!title || !file || file.size === 0) return { error: 'Título e arquivo são obrigatórios.' }

  const supabase = createAdminClient()
  const ext = file.name.split('.').pop()
  const path = `documents/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { contentType: file.type })

  if (uploadError) return { error: 'Erro ao fazer upload: ' + uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

  const fileType = file.type.includes('pdf') ? 'pdf' : 'image'

  const { error: insertError } = await supabase.from('documents').insert({
    title,
    description: description || null,
    file_url: publicUrl,
    file_type: fileType,
  })

  if (insertError) return { error: 'Erro ao salvar documento.' }

  revalidatePath('/admin/documentos')
  return { error: null }
}

export async function deleteDocument(docId: string, fileUrl: string) {
  const supabase = createAdminClient()

  const marker = '/object/public/documents/'
  const idx = fileUrl.indexOf(marker)
  if (idx !== -1) {
    const path = fileUrl.slice(idx + marker.length)
    await supabase.storage.from('documents').remove([path])
  }

  await supabase.from('documents').delete().eq('id', docId)
  revalidatePath('/admin/documentos')
}
