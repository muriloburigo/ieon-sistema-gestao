import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'

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
        <div className="grid gap-4 sm:grid-cols-2">
          {documents.map((doc: any) => (
            <a
              key={doc.id}
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-zinc-800 hover:border-orange rounded-xl p-5 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">
                  {doc.file_type === 'pdf' ? '📄' : doc.file_type === 'image' ? '🖼️' : '🎥'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white group-hover:text-orange transition-colors truncate">
                    {doc.title}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{doc.description}</p>
                  )}
                  <p className="text-xs text-zinc-600 mt-2">
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
