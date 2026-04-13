import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import DownloadButton from './DownloadButton'

export default async function TransparenciaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prestação de Contas</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Veja como seus recursos estão sendo utilizados.
        </p>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">📋</p>
          <p>Nenhum documento publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <div key={doc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
              <span className="text-2xl shrink-0">
                {doc.file_type === 'pdf' ? '📄' : '🖼️'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{doc.title}</p>
                {doc.description && (
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{doc.description}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">
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
                  Visualizar
                </a>
                <DownloadButton url={doc.file_url} filename={doc.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
