import { createAdminClient } from '~/lib/supabase/server'
import AuditoriaClient from './AuditoriaClient'

export default async function AuditoriaPage() {
  const supabase = createAdminClient()

  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error?.code === '42P01') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Auditoria</h1>
          <p className="text-zinc-400 text-sm mt-1">Registro de todas as ações administrativas.</p>
        </div>
        <div className="bg-zinc-900 border border-orange/30 rounded-xl p-6">
          <p className="text-orange font-medium text-sm mb-3">Configuração necessária</p>
          <p className="text-zinc-400 text-sm mb-4">Execute o SQL abaixo no <strong className="text-white">SQL Editor do Supabase</strong> para criar a tabela de auditoria:</p>
          <pre className="bg-zinc-950 rounded-lg p-4 text-xs text-zinc-300 overflow-auto">{`CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid,
  admin_name text,
  admin_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  entity_label text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);`}</pre>
        </div>
      </div>
    )
  }

  return <AuditoriaClient logs={logs ?? []} />
}
