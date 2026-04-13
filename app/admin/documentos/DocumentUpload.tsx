'use client'

import { useState, useRef } from 'react'
import { uploadDocument } from './actions'

export default function DocumentUpload() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await uploadDocument(new FormData(e.currentTarget))
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      formRef.current?.reset()
      setOpen(false)
      setLoading(false)
    }
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
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
        >
          <h3 className="font-semibold text-white">Novo documento</h3>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Título</label>
            <input
              name="title"
              type="text"
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
              placeholder="Ex: Relatório Abril 2026"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Descrição (opcional)</label>
            <textarea
              name="description"
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 uppercase tracking-wider">Arquivo (PDF ou imagem)</label>
            <input
              name="file"
              type="file"
              accept=".pdf,image/*"
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
