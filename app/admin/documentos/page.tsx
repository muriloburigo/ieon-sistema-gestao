import { createAdminClient } from '~/lib/supabase/server'
import DocumentUpload from './DocumentUpload'
import DocumentosClient from './DocumentosClient'

export default async function DocumentosPage() {
  const supabase = createAdminClient()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Documentos</h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie relatórios e documentos de prestação de contas.</p>
      </div>

      <DocumentUpload />
      <DocumentosClient documents={documents ?? []} />
    </div>
  )
}
