'use client'

import { useState } from 'react'
import { createClient } from '~/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DocumentUpload() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Upload file to storage
    const ext = file.name.split('.').pop()
    const path = `documents/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)

    if (uploadError) {
      setError('Erro ao fazer upload do arquivo.')
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

    const fileType = file.type.includes('pdf')
      ? 'pdf'
      : file.type.includes('image')
      ? 'image'
      : 'video'

    await supabase.from('documents').insert({
      title,
      description: description || null,
      file_url: publicUrl,
      file_type: fileType,
    })

    setTitle('')
    setDescription('')
    setFile(null)
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/90 transition-colors"
        >
          + Publicar documento
        </button>
      ) : (
        <form
          onSubmit={handleUpload}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
        >
          <h3 className="font-semibold text-white">Novo documento</h3>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
              placeholder="Ex: Relatório Abril 2026"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Descrição (opcional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Arquivo (PDF, imagem ou vídeo)</label>
            <input
              type="file"
              accept=".pdf,image/*,video/*"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              required
              className="w-full text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white file:text-xs hover:file:bg-zinc-600"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
