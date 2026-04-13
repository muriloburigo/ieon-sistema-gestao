import { createClient } from '~/lib/supabase/server'
import PaymentActions from './PaymentActions'

export default async function PagamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; month?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentMonth = params.month ?? new Date().toISOString().slice(0, 7)

  let query = supabase
    .from('payments')
    .select('*, subscriptions(plan_value, donor_id, donors(name, email, whatsapp))')
    .eq('reference_month', currentMonth)
    .order('created_at', { ascending: false })

  if (params.filter === 'pending') query = query.eq('status', 'pending')
  if (params.filter === 'paid') query = query.eq('status', 'paid')

  const { data: payments } = await query

  function formatMonth(yyyyMM: string) {
    const [year, month] = yyyyMM.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pagamentos</h1>
          <p className="text-zinc-400 text-sm mt-1 capitalize">{formatMonth(currentMonth)}</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'paid'] as const).map(f => (
            <a
              key={f}
              href={`/admin/pagamentos?filter=${f}&month=${currentMonth}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (params.filter ?? 'all') === f
                  ? 'bg-orange text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Pagos'}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {payments?.map((p: any) => {
          const donor = p.subscriptions?.donors
          const whatsappMsg = encodeURIComponent(
            `Olá ${donor?.name?.split(' ')[0]}, tudo bem? 😊\n\nPassando para lembrar da sua contribuição de R$ ${p.subscriptions?.plan_value} ao Instituto Endurance On referente a ${formatMonth(p.reference_month)}.\n\nConta corrente: [DADOS BANCÁRIOS]\n\nQualquer dúvida, estou à disposição! 🧡`
          )
          const whatsappLink = donor?.whatsapp
            ? `https://wa.me/55${donor.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`
            : null

          return (
            <div
              key={p.id}
              className={`bg-zinc-900 border rounded-xl px-5 py-4 flex items-center justify-between gap-4 ${
                p.status === 'pending' ? 'border-orange/20' : 'border-zinc-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{donor?.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{donor?.email}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-white">R$ {p.subscriptions?.plan_value}</p>
                <span className={`text-xs ${p.status === 'paid' ? 'text-green-400' : 'text-orange'}`}>
                  {p.status === 'paid' ? '✓ Pago' : '⏳ Pendente'}
                </span>
              </div>

              <PaymentActions
                paymentId={p.id}
                status={p.status}
                whatsappLink={whatsappLink}
                donorEmail={donor?.email}
              />
            </div>
          )
        })}

        {payments?.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <p>Nenhum pagamento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
