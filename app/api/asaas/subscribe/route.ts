import { createClient, createAdminClient } from '~/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  getOrCreateCustomer,
  createSubscription,
  getSubscriptionPayments,
  getNextDueDate,
  isAsaasConfigured,
} from '~/lib/asaas'
import type { PlanValue } from '~/lib/types'

const VALID_PLANS: PlanValue[] = [5, 10, 15, 50, 100]

export async function POST(request: Request) {
  if (!isAsaasConfigured()) {
    return NextResponse.json({ error: 'Gateway de pagamento não configurado.' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  let body: { plan_value?: number; cpf?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const { plan_value, cpf } = body
  if (!plan_value || !VALID_PLANS.includes(plan_value as PlanValue)) {
    return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
  }

  const db = createAdminClient()

  // Load donor
  const { data: donor, error: donorErr } = await db
    .from('donors')
    .select('id, name, email, whatsapp, cpf, asaas_customer_id')
    .eq('id', user.id)
    .single()

  if (donorErr || !donor) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  }

  // Resolve CPF
  const cpfToUse = cpf?.replace(/\D/g, '') || donor.cpf
  if (!cpfToUse) {
    return NextResponse.json({ error: 'CPF obrigatório para emissão do boleto/pix.' }, { status: 422 })
  }

  // Persist CPF if new
  if (!donor.cpf && cpfToUse) {
    await db.from('donors').update({ cpf: cpfToUse }).eq('id', user.id)
  }

  // Get or create Asaas customer
  let asaasCustomerId: string = donor.asaas_customer_id
  if (!asaasCustomerId) {
    try {
      const customer = await getOrCreateCustomer({
        name: donor.name,
        email: donor.email,
        cpfCnpj: cpfToUse,
        mobilePhone: donor.whatsapp ?? undefined,
      })
      asaasCustomerId = customer.id
      await db.from('donors').update({ asaas_customer_id: asaasCustomerId }).eq('id', user.id)
    } catch (err) {
      console.error('[Asaas] createCustomer error:', err)
      return NextResponse.json(
        { error: 'Erro ao registrar cliente no gateway de pagamento.' },
        { status: 502 }
      )
    }
  }

  // Create Asaas subscription
  let asaasSubscriptionId: string
  let firstPaymentUrl: string | null = null

  try {
    const sub = await createSubscription({
      customer: asaasCustomerId,
      billingType: 'UNDEFINED', // customer picks boleto/pix/card at checkout
      value: plan_value,
      nextDueDate: getNextDueDate(),
      cycle: 'MONTHLY',
      description: `Contribuição mensal IEON — R$ ${plan_value},00`,
      externalReference: user.id,
    })
    asaasSubscriptionId = sub.id
  } catch (err) {
    console.error('[Asaas] createSubscription error:', err)
    return NextResponse.json(
      { error: 'Erro ao criar assinatura no gateway de pagamento.' },
      { status: 502 }
    )
  }

  // Upsert subscription in our DB
  const { data: dbSub } = await db
    .from('subscriptions')
    .upsert(
      {
        donor_id: user.id,
        plan_value,
        joined_at: new Date().toISOString(),
        asaas_subscription_id: asaasSubscriptionId,
        status: 'active',
      },
      { onConflict: 'donor_id' }
    )
    .select('id')
    .single()

  // Fetch first payment to get the checkout URL
  try {
    const payments = await getSubscriptionPayments(asaasSubscriptionId)
    const first = payments[0]
    if (first && dbSub) {
      const refMonth = first.dueDate.slice(0, 7)
      await db.from('payments').upsert(
        {
          subscription_id: dbSub.id,
          reference_month: refMonth,
          status: 'pending',
          asaas_payment_id: first.id,
          asaas_invoice_url: first.invoiceUrl,
        },
        { onConflict: 'subscription_id,reference_month' }
      )
      firstPaymentUrl = first.invoiceUrl
    }
  } catch (err) {
    console.error('[Asaas] getSubscriptionPayments error:', err)
    // Non-fatal — redirect to dashboard as fallback
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.json({
    paymentUrl: firstPaymentUrl ?? `${baseUrl}/dashboard`,
    asaasSubscriptionId,
  })
}
