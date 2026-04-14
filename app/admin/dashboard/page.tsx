import { createAdminClient } from '~/lib/supabase/server'
import Link from 'next/link'

function daysLate(joinedAt: string, referenceMonth: string): number {
  const joinedDay = new Date(joinedAt).getDate()
  const [year, month] = referenceMonth.split('-')
  const dueDate = new Date(Number(year), Number(month) - 1, joinedDay)
  return Math.floor((Date.now() - dueDate.getTime()) / 86400000)
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const currentMonth = new Date().toISOString().slice(0, 7)

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, donors!inner(*), payments(*)')
    .eq('status', 'active')
    .eq('donors.is_admin', false)

  const active = subscriptions?.filter((s: any) => s.donors?.status === 'active') ?? []
  const inactive = subscriptions?.filter((s: any) => s.donors?.status === 'inactive') ?? []

  const overdue = active.filter((s: any) => {
    const payment = s.payments?.find((p: any) => p.reference_month === currentMonth)
    if (!payment || payment.status === 'paid') return false
    return daysLate(s.joined_at, currentMonth) > 0
  })

  const monthlyRevenue = active.reduce((sum: number, s: any) => sum + s.plan_value, 0)

  const kpis = [
    { label: 'Assinantes Ativos',  value: active.length,    icon: '👥', bg: 'bg-blue/10 text-blue' },
    { label: 'Contas Inativas',      value: inactive.length,  icon: '⊘',  bg: 'bg-zinc-700/50 text-zinc-400' },
    { label: 'Atrasados',           value: overdue.length,   icon: '⏱',  bg: 'bg-orange/10 text-orange' },
    { label: 'Receita Mensal',
      value: `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      sub: 'Assinaturas ativas', icon: '$', bg: 'bg-green-500/10 text-green-400', large: true },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
        <p className="text-zinc-400 text-sm mt-1">Visão geral das assinaturas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon, bg, large }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">{label}</p>
              <p className={`font-bold text-white mt-1 ${large ? 'text-xl' : 'text-3xl'}`}>{value}</p>
              {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${bg}`}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Atrasados */}
      {overdue.length > 0 && (
        <div className="bg-zinc-900 border border-red-500/20 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm">⚠</span>
              <h2 className="font-semibold text-white">Atrasados — Requer Baixa Manual</h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Assinaturas ativas que passaram da data de renovação mensal</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {overdue.map((s: any) => {
              const days = daysLate(s.joined_at, currentMonth)
              const joinedDay = new Date(s.joined_at).getDate()
              const [y, m] = currentMonth.split('-')
              const dueDate = new Date(Number(y), Number(m) - 1, joinedDay).toLocaleDateString('pt-BR')
              return (
                <div key={s.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{s.donors?.name}</p>
                    <p className="text-xs text-zinc-500">{s.donors?.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-white">R$ {s.plan_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-zinc-500">Venceu: {dueDate}</p>
                  </div>
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium shrink-0">
                    ⚠ {days}d atraso
                  </span>
                  <Link
                    href={`/admin/assinaturas`}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                  >
                    Gerenciar →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
