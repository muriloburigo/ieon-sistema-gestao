import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PlanValue } from '~/lib/types'

const PLAN_VALUES: PlanValue[] = [5, 10, 15, 50, 100]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: donor } = await supabase
    .from('donors')
    .select('*, subscriptions(*, payments(*))')
    .eq('id', user.id)
    .single()

  const subscription = donor?.subscriptions?.[0]
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const currentPayment = subscription?.payments?.find((p: any) => p.reference_month === currentMonth)

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Olá, {donor?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Obrigado por fazer parte do movimento.</p>
      </div>

      {/* Current status */}
      {subscription ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-silver uppercase tracking-wider mb-1">Plano atual</p>
              <p className="text-3xl font-bold text-white">
                R$ {subscription.plan_value}
                <span className="text-base font-normal text-zinc-400">/mês</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentPayment?.status === 'paid'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-orange/10 text-orange border border-orange/20'
            }`}>
              {currentPayment?.status === 'paid' ? '✓ Pago' : '⏳ Pendente'}
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Membro desde {new Date(subscription.joined_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      ) : (
        /* Plan selection */
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Escolha seu plano</h2>
            <p className="text-zinc-400 text-sm mt-1">Selecione o valor da sua contribuição mensal.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PLAN_VALUES.map(value => (
              <form key={value} action="/api/donor/subscribe" method="POST">
                <input type="hidden" name="plan_value" value={value} />
                <button
                  type="submit"
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-orange rounded-xl p-4 text-center transition-colors group"
                >
                  <p className="text-xl font-bold text-white group-hover:text-orange transition-colors">
                    R$ {value}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">/mês</p>
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* Impact message */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <p className="text-sm text-zinc-400 leading-relaxed">
          Sua contribuição apoia diretamente as ações sociais do Instituto Endurance On —
          levando esporte, saúde e transformação para quem mais precisa.
        </p>
      </div>
    </div>
  )
}
