import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAsaasConfigured } from '~/lib/asaas'
import PlanSelection from './PlanSelection'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()
  const { data: donor } = await db
    .from('donors')
    .select('*, subscriptions(*, payments(*))')
    .eq('id', user.id)
    .single()

  // PostgREST returns subscriptions as object (not array) due to UNIQUE(donor_id)
  const rawSub = donor?.subscriptions
  const subscription = rawSub ? (Array.isArray(rawSub) ? rawSub[0] : rawSub) : null
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentPayment = subscription?.payments?.find((p: any) => p.reference_month === currentMonth)

  const asaasEnabled = isAsaasConfigured()
  const isPending = subscription?.status === 'pending'

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Olá, {donor?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Obrigado por fazer parte do movimento.</p>
      </div>

      {subscription ? (
        isPending ? (
          /* ── Pending: awaiting payment confirmation ── */
          <div className="bg-zinc-900 border border-yellow-500/20 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-silver uppercase tracking-wider mb-1">Plano selecionado</p>
                <p className="text-3xl font-bold text-white">
                  R$ {subscription.plan_value}
                  <span className="text-base font-normal text-zinc-400">/mês</span>
                </p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shrink-0">
                ⏳ Aguardando pagamento
              </span>
            </div>

            {currentPayment?.asaas_invoice_url && (
              <a
                href={currentPayment.asaas_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange hover:bg-orange/90 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Ir para pagamento →
              </a>
            )}

            <p className="text-xs text-zinc-500">
              Sua assinatura será ativada automaticamente após a confirmação do pagamento.
            </p>
          </div>
        ) : (
          /* ── Active subscription ── */
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

            {currentPayment?.asaas_invoice_url && currentPayment.status !== 'paid' && (
              <a
                href={currentPayment.asaas_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-orange hover:text-orange/80 transition-colors"
              >
                Ver fatura / Pagar agora →
              </a>
            )}

            <p className="text-xs text-zinc-500">
              Membro desde{' '}
              {new Date(subscription.joined_at).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )
      ) : (
        /* ── No subscription: plan selection ── */
        <PlanSelection hasCpf={Boolean(donor?.cpf)} asaasEnabled={asaasEnabled} />
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
