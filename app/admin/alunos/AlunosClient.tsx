'use client'

import { useState } from 'react'
import { createClient } from '~/lib/supabase/client'
import { useRouter } from 'next/navigation'

const FILTERS = ['Todos', 'Ativos', 'Inadimplentes', 'Cancelados'] as const

export default function AlunosClient({ donors }: { donors: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Todos')

  const filtered = donors.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q)
    const activeSub = d.subscriptions?.find((s: any) => s.status === 'active')
    const matchFilter =
      filter === 'Todos' ? true :
      filter === 'Ativos' ? d.status === 'active' && activeSub :
      filter === 'Inadimplentes' ? d.status === 'inactive' :
      filter === 'Cancelados' ? !activeSub && d.status === 'active' : true
    return matchSearch && matchFilter
  })

  async function toggleStatus(donorId: string, current: string) {
    const next = current === 'active' ? 'inactive' : 'active'
    if (!confirm(`Alterar status para "${next === 'active' ? 'Ativo' : 'Inadimplente'}"?`)) return
    const supabase = createClient()
    await supabase.from('donors').update({ status: next }).eq('id', donorId)
    router.refresh()
  }

  function exportCSV() {
    const rows = [['Nome', 'Email', 'Status', 'Plano Ativo', 'Cadastrado em']]
    filtered.forEach(d => {
      const activeSub = d.subscriptions?.find((s: any) => s.status === 'active')
      rows.push([
        d.name, d.email,
        d.status === 'active' ? 'Ativo' : 'Inadimplente',
        activeSub ? `R$ ${activeSub.plan_value}` : '—',
        new Date(d.created_at).toLocaleDateString('pt-BR'),
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'alunos.csv'; a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestão de Alunos</h1>
        <p className="text-zinc-400 text-sm mt-1">Todos os alunos cadastrados na plataforma</p>
      </div>

      {/* Search + Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-60 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-orange text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 rounded-lg text-xs flex items-center gap-1 transition-colors"
          >
            ↓ Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-sm text-zinc-400">{filtered.length} aluno{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Nome', 'Email', 'Status', 'Plano Ativo', 'Cadastrado em', 'Ações'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((d: any) => {
              const activeSub = d.subscriptions?.find((s: any) => s.status === 'active')
              return (
                <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-white">{d.name}</td>
                  <td className="px-5 py-4 text-sm text-zinc-400">{d.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      d.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-orange/10 text-orange border-orange/20'
                    }`}>
                      {d.status === 'active' ? '✓ Ativo' : 'Inadimplente'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-white">
                    {activeSub
                      ? <span className="font-semibold">R$ {activeSub.plan_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      : <span className="text-zinc-600">—</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {new Date(d.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleStatus(d.id, d.status)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                        d.status === 'active'
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                          : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                      }`}
                    >
                      {d.status === 'active' ? 'Marcar Inadimplente' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-zinc-600 text-sm">Nenhum aluno encontrado.</div>
        )}
      </div>
    </div>
  )
}
