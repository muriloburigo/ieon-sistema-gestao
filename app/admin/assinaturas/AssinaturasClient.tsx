'use client'

import { useState } from 'react'
import { editSubscriptionPlan, cancelSubscription, activateSubscription } from './actions'

type SubStatus = 'active' | 'overdue' | 'user_inactive' | 'cancelled' | 'pending_payment'

function getStatus(sub: any): SubStatus {
  if (sub.status === 'cancelled') return 'cancelled'
  if (sub.status === 'pending') return 'pending_payment'
  if (sub.donors?.status === 'inactive') return 'user_inactive'
  const currentMonth = new Date().toISOString().slice(0, 7)
  const payment = sub.payments?.find((p: any) => p.reference_month === currentMonth)
  if (payment?.status === 'pending') {
    const joinedDay = new Date(sub.joined_at).getDate()
    const [y, m] = currentMonth.split('-')
    const due = new Date(Number(y), Number(m) - 1, joinedDay)
    if (Date.now() > due.getTime()) return 'overdue'
  }
  return 'active'
}

const STATUS_LABEL: Record<SubStatus, string> = {
  active:          'Ativa',
  overdue:         'Atrasado',
  user_inactive:   'Inativo',
  cancelled:       'Cancelada',
  pending_payment: 'Ag. Pagamento',
}
const STATUS_STYLE: Record<SubStatus, string> = {
  active:          'bg-green-500/10 text-green-400 border-green-500/20',
  overdue:         'bg-red-500/10 text-red-400 border-red-500/20',
  user_inactive:   'bg-zinc-700/50 text-zinc-400 border-zinc-600',
  cancelled:       'bg-zinc-700/30 text-zinc-500 border-zinc-700',
  pending_payment: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

const FILTERS = ['Todas', 'Ativas', 'Ag. Pagamento', 'Pendentes', 'Inativos', 'Canceladas', 'Atrasadas'] as const

export default function AssinaturasClient({ subscriptions }: { subscriptions: any[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Todas')
  const [editId, setEditId] = useState<string | null>(null)
  const [editPlan, setEditPlan] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const enriched = subscriptions.map(s => ({ ...s, _status: getStatus(s) }))

  const filtered = enriched.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.donors?.name?.toLowerCase().includes(q) || s.donors?.email?.toLowerCase().includes(q)
    const matchFilter =
      filter === 'Todas' ? true :
      filter === 'Ativas' ? s._status === 'active' :
      filter === 'Pendentes' ? (() => {
        const cur = new Date().toISOString().slice(0, 7)
        return s.payments?.some((p: any) => p.reference_month === cur && p.status === 'pending')
      })() :
      filter === 'Ag. Pagamento' ? s._status === 'pending_payment' :
      filter === 'Inativos' ? s._status === 'user_inactive' :
      filter === 'Canceladas' ? s._status === 'cancelled' :
      filter === 'Atrasadas' ? s._status === 'overdue' : true
    return matchSearch && matchFilter
  })

  async function saveEdit(sub: any) {
    setSaving(true)
    await editSubscriptionPlan(sub.id, sub.donors?.name ?? sub.id, sub.plan_value, editPlan)
    setSaving(false)
    setEditId(null)
  }

  async function handleCancel(sub: any) {
    if (!confirm('Cancelar esta assinatura?')) return
    await cancelSubscription(sub.id, sub.donors?.name ?? sub.id)
  }

  async function handleActivate(sub: any) {
    if (!confirm(`Ativar manualmente a assinatura de "${sub.donors?.name}"?`)) return
    await activateSubscription(sub.id, sub.donors?.name ?? sub.id)
  }

  function exportCSV() {
    const rows = [['Aluno', 'Email', 'Plano', 'Status', 'Data Início']]
    filtered.forEach(s => rows.push([
      s.donors?.name, s.donors?.email,
      `R$ ${s.plan_value}`, STATUS_LABEL[s._status as SubStatus],
      new Date(s.joined_at).toLocaleDateString('pt-BR'),
    ]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'assinaturas.csv'; a.click()
  }

  return (
    <div className="space-y-6">
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
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-orange text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
              }`}>{f}</button>
          ))}
          <button onClick={exportCSV}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 rounded-lg text-xs flex items-center gap-1 transition-colors">
            ↓ Exportar
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-sm text-zinc-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Aluno', 'Email', 'Plano', 'Status', 'Data Início', 'Ações'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((s: any) => (
              <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-white">{s.donors?.name}</td>
                <td className="px-5 py-4 text-sm text-zinc-400">{s.donors?.email}</td>
                <td className="px-5 py-4">
                  {editId === s.id ? (
                    <select value={editPlan} onChange={e => setEditPlan(Number(e.target.value))}
                      className="bg-zinc-800 border border-orange text-white rounded px-2 py-1 text-sm">
                      {[5, 10, 15, 50, 100].map(v => (
                        <option key={v} value={v}>R$ {v},00</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      R$ {s.plan_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLE[s._status as SubStatus]}`}>
                    {s._status === 'active' && '✓ '}{STATUS_LABEL[s._status as SubStatus]}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {new Date(s.joined_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-4">
                  {editId === s.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(s)} disabled={saving}
                        className="px-3 py-1 bg-orange text-white text-xs rounded-lg hover:bg-orange/90 disabled:opacity-50">
                        {saving ? '...' : 'Salvar'}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="px-3 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-lg hover:bg-zinc-600">✕</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {s._status === 'pending_payment' ? (
                        <>
                          <button onClick={() => handleActivate(s)}
                            className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs rounded-lg hover:bg-green-500/20 transition-colors">
                            Ativar
                          </button>
                          <button onClick={() => handleCancel(s)}
                            className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-lg hover:bg-red-500/20 transition-colors">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(s.id); setEditPlan(s.plan_value) }}
                            className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-lg hover:bg-zinc-700 border border-zinc-700 transition-colors">
                            Editar
                          </button>
                          {s._status !== 'cancelled' && (
                            <button onClick={() => handleCancel(s)}
                              className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-lg hover:bg-red-500/20 transition-colors">
                              Cancelar
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-zinc-600 text-sm">Nenhuma assinatura encontrada.</div>
        )}
      </div>
    </div>
  )
}
