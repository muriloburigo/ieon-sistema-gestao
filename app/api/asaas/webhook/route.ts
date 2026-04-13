// Asaas Webhook Handler
// Configure the webhook URL in Asaas Dashboard → Configurações → Notificações
// URL: https://your-domain.com/api/asaas/webhook

import { createAdminClient } from '~/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { AsaasWebhookPayload } from '~/lib/asaas'

export async function POST(request: NextRequest) {
  // Verify request comes from Asaas using the access token header
  const token = request.headers.get('asaas-access-token')
  if (!process.env.ASAAS_API_KEY || token !== process.env.ASAAS_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: AsaasWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, payment, subscription } = payload

  const db = createAdminClient()

  // ─── Payment confirmed / received ─────────────────────────────
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    if (!payment) return NextResponse.json({ ok: true })

    const paidAt = payment.paymentDate
      ? new Date(payment.paymentDate).toISOString()
      : new Date().toISOString()

    // Try to find by asaas_payment_id (already synced)
    const { data: existing } = await db
      .from('payments')
      .select('id')
      .eq('asaas_payment_id', payment.id)
      .maybeSingle()

    if (existing) {
      await db.from('payments').update({ status: 'paid', paid_at: paidAt }).eq('id', existing.id)
    } else if (payment.subscription) {
      // Find our subscription and upsert the payment record
      const { data: sub } = await db
        .from('subscriptions')
        .select('id')
        .eq('asaas_subscription_id', payment.subscription)
        .maybeSingle()

      if (sub) {
        const refMonth = payment.dueDate.slice(0, 7) // YYYY-MM
        await db.from('payments').upsert(
          {
            subscription_id: sub.id,
            reference_month: refMonth,
            status: 'paid',
            paid_at: paidAt,
            asaas_payment_id: payment.id,
            asaas_invoice_url: payment.invoiceUrl,
          },
          { onConflict: 'subscription_id,reference_month' }
        )
      }
    }
  }

  // ─── Payment overdue ───────────────────────────────────────────
  // We handle overdue display via date logic in the admin panel.
  // Optionally mark donor as inactive after N consecutive overdue payments.

  // ─── Payment refunded ─────────────────────────────────────────
  if (event === 'PAYMENT_REFUNDED') {
    if (!payment) return NextResponse.json({ ok: true })

    const { data: existing } = await db
      .from('payments')
      .select('id')
      .eq('asaas_payment_id', payment.id)
      .maybeSingle()

    if (existing) {
      await db.from('payments').update({ status: 'pending', paid_at: null }).eq('id', existing.id)
    }
  }

  // ─── New payment created (e.g. next month's cycle) ────────────
  if (event === 'PAYMENT_CREATED') {
    if (!payment?.subscription) return NextResponse.json({ ok: true })

    const { data: sub } = await db
      .from('subscriptions')
      .select('id')
      .eq('asaas_subscription_id', payment.subscription)
      .maybeSingle()

    if (sub) {
      const refMonth = payment.dueDate.slice(0, 7)
      await db.from('payments').upsert(
        {
          subscription_id: sub.id,
          reference_month: refMonth,
          status: 'pending',
          asaas_payment_id: payment.id,
          asaas_invoice_url: payment.invoiceUrl,
        },
        { onConflict: 'subscription_id,reference_month' }
      )
    }
  }

  // ─── Subscription deleted / cancelled ─────────────────────────
  if (event === 'SUBSCRIPTION_DELETED' || event === 'SUBSCRIPTION_CANCELLED') {
    const asaasSubId = subscription?.id ?? payment?.subscription
    if (asaasSubId) {
      await db
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('asaas_subscription_id', asaasSubId)
    }
  }

  return NextResponse.json({ ok: true })
}
