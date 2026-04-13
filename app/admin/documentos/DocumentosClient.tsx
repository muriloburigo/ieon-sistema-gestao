'use client'

import { useState } from 'react'
import { deleteDocument } from './actions'

export default function DocumentosClient({ documents }: { documents: any[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(doc: any) {
    if (!confirm(`Excluir "${doc.title}"?`)) return
    setDeleting(doc.id)
    await deleteDocument(doc.id, doc.file_url)
    setDeleting(null)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-600 text-sm">
        Nenhum documento publicado ainda.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc: any) => (
        <div key={doc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
          <span className="text-xl shrink-0">
            {doc.file_type === 'pdf' ? '📄' : '🖼️'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{doc.title}</p>
            {doc.description && (
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{doc.description}</p>
            )}
            <p className="text-xs text-zinc-600 mt-0.5">
              {new Date(doc.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs hover:bg-zinc-700 transition-colors"
            >
              Ver
            </a>
            <button
              onClick={() => handleDelete(doc)}
              disabled={deleting === doc.id}
              className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {deleting === doc.id ? '...' : 'Excluir'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
