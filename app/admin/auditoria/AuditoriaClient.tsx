'use client'

import { useState } from 'react'

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  edit_plan:            { label: 'Editou plano',         color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  cancel_subscription:  { label: 'Cancelou assinatura',  color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  toggle_donor_status:  { label: 'Alterou status aluno', color: 'text-orange bg-orange/10 border-orange/20' },
  upload_document:      { label: 'Publicou documento',   color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  delete_document:      { label: 'Excluiu documento',    color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  create_user:          { label: 'Criou usuário',        color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  toggle_admin:         { label: 'Alterou permissão',    color: 'text-orange bg-orange/10 border-orange/20' },
  delete_user:          { label: 'Excluiu usuário',      color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

function DataCell({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return <span className="text-zinc-600">—</span>
  return (
    <div className="space-y-0.5">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="text-xs">
          <span className="text-zinc-500">{k}: </span>
          <span className="text-zinc-300">{String(v)}</span>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const ENTITY_FILTER = ['Todos', 'subscription', 'donor', 'document', 'user'] as const
const ENTITY_LABEL: Record<string, string> = {
  subscription: 'Assinatura', donor: 'Aluno', document: 'Documento', user: 'Usuário',
}

export default function AuditoriaClient({ logs }: { logs: any[] }) {
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<string>('Todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.admin_name?.toLowerCase().includes(q) ||
      l.admin_email?.toLowerCase().includes(q) ||
      l.entity_label?.toLowerCase().includes(q) ||
      ACTION_LABEL[l.action]?.label.toLowerCase().includes(q)
    const matchEntity = entityFilter === 'Todos' || l.entity === entityFilter
    return matchSearch && matchEntity
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Auditoria</h1>
        <p className="text-zinc-400 text-sm mt-1">Registro completo de ações administrativas.</p>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-60 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por admin, aluno, ação..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange" />
        </div>
        <div className="flex flex-wrap gap-2">
          {ENTITY_FILTER.map(f => (
            <button key={f} onClick={() => setEntityFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                entityFilter === f ? 'bg-orange text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
              }`}>
              {f === 'Todos' ? 'Todos' : ENTITY_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-sm text-zinc-400">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 text-sm">Nenhum registro encontrado.</div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {filtered.map((log: any) => {
              const meta = ACTION_LABEL[log.action] ?? { label: log.action, color: 'text-zinc-400 bg-zinc-800 border-zinc-700' }
              const isOpen = expanded === log.id
              return (
                <div key={log.id}
                  className="px-5 py-4 hover:bg-zinc-800/20 transition-colors cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : log.id)}
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Timestamp */}
                    <div className="shrink-0 w-36">
                      <p className="text-xs text-zinc-400">{formatDate(log.created_at)}</p>
                    </div>

                    {/* Admin */}
                    <div className="shrink-0 min-w-36">
                      <p className="text-sm font-medium text-white">{log.admin_name}</p>
                      <p className="text-xs text-zinc-500">{log.admin_email}</p>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Entity */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 truncate">{log.entity_label ?? '—'}</p>
                      <p className="text-xs text-zinc-600">{ENTITY_LABEL[log.entity] ?? log.entity}</p>
                    </div>

                    <span className="text-zinc-600 text-xs shrink-0">{isOpen ? '▲' : '▼'}</span>
                  </div>

                  {/* Expanded: before / after */}
                  {isOpen && (
                    <div className="mt-4 grid grid-cols-2 gap-4" onClick={e => e.stopPropagation()}>
                      <div className="bg-zinc-950 rounded-lg p-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Situação anterior</p>
                        <DataCell data={log.before_data} />
                      </div>
                      <div className="bg-zinc-950 rounded-lg p-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Nova situação</p>
                        <DataCell data={log.after_data} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
