import { createClient } from '~/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const currentMonth = new Date().toISOString().slice(0, 7)

  const [{ data: subscriptions }, { data: payments }] = await Promise.all([
    supabase.from('subscriptions').select('plan_value, donors(status)').eq('donors.status', 'active'),
    supabase.from('payments').select('status, subscriptions(plan_value)').eq('reference_month', currentMonth),
  ])

  const activeSubscriptions = subscriptions?.filter((s: any) => s.donors?.status === 'active') ?? []
  const monthlyForecast = activeSubscriptions.reduce((sum: number, s: any) => sum + (s.plan_value ?? 0), 0)
  const received = payments
    ?.filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + (p.subscriptions?.plan_value ?? 0), 0) ?? 0
  const pending = payments
    ?.filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + (p.subscriptions?.plan_value ?? 0), 0) ?? 0

  const stats = [
    { label: 'Previsão mensal', value: `R$ ${monthlyForecast}`, sub: `${activeSubscriptions.length} assinantes ativos`, color: 'border-zinc-700' },
    { label: 'Recebido este mês', value: `R$ ${received}`, sub: 'Confirmados', color: 'border-green-500/30' },
    { label: 'Pendente', value: `R$ ${pending}`, sub: 'Aguardando confirmação', color: 'border-orange/30' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, sub, color }) => (
          <div key={label} className={`bg-zinc-900 border ${color} rounded-xl p-5`}>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/admin/pagamentos?filter=pending" className="bg-zinc-900 border border-zinc-800 hover:border-orange rounded-xl p-5 transition-colors group">
          <p className="text-2xl mb-2">⏳</p>
          <p className="font-medium text-white group-hover:text-orange transition-colors">Pendentes</p>
          <p className="text-xs text-zinc-500 mt-1">Ver cobranças em aberto</p>
        </a>
        <a href="/admin/assinantes" className="bg-zinc-900 border border-zinc-800 hover:border-blue rounded-xl p-5 transition-colors group">
          <p className="text-2xl mb-2">👥</p>
          <p className="font-medium text-white group-hover:text-blue transition-colors">Assinantes</p>
          <p className="text-xs text-zinc-500 mt-1">Gestão de doadores</p>
        </a>
      </div>
    </div>
  )
}
