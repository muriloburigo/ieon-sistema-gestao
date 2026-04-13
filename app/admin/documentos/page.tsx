import { createClient } from '~/lib/supabase/server'
import DocumentUpload from './DocumentUpload'

export default async function DocumentosPage() {
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Documentos</h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie relatórios e mídias de prestação de contas.</p>
      </div>

      <DocumentUpload />

      <div className="space-y-3">
        {documents?.map((doc: any) => (
          <div key={doc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xl">
                {doc.file_type === 'pdf' ? '📄' : doc.file_type === 'image' ? '🖼️' : '🎥'}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
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
            </div>
          </div>
        ))}
        {documents?.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <p>Nenhum documento publicado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
