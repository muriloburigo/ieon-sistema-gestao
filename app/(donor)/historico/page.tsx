import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HistoricoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()
  const { data: subscription } = await db
    .from('subscriptions')
    .select('*, payments(*)')
    .eq('donor_id', user.id)
    .single()

  const payments = subscription?.payments?.sort((a: any, b: any) =>
    b.reference_month.localeCompare(a.reference_month)
  ) ?? []

  function formatMonth(yyyyMM: string) {
    const [year, month] = yyyyMM.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Histórico</h1>
        <p className="text-zinc-400 text-sm mt-1">Suas contribuições ao longo do tempo.</p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p>Nenhuma contribuição registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p: any) => (
            <div
              key={p.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white capitalize">{formatMonth(p.reference_month)}</p>
                {p.paid_at && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Pago em {new Date(p.paid_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">
                  R$ {subscription.plan_value}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  p.status === 'paid'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-orange/10 text-orange'
                }`}>
                  {p.status === 'paid' ? 'Pago' : 'Pendente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
