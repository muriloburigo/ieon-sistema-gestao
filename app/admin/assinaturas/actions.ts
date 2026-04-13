'use server'

import { createAdminClient } from '~/lib/supabase/server'
import { logAudit } from '~/lib/audit'
import { revalidatePath } from 'next/cache'

export async function editSubscriptionPlan(
  subId: string, donorName: string, oldPlan: number, newPlan: number
) {
  const db = createAdminClient()
  await db.from('subscriptions').update({ plan_value: newPlan }).eq('id', subId)
  await logAudit({
    action: 'edit_plan',
    entity: 'subscription',
    entityId: subId,
    entityLabel: donorName,
    before: { plano: `R$ ${oldPlan},00` },
    after: { plano: `R$ ${newPlan},00` },
  })
  revalidatePath('/admin/assinaturas')
}

export async function cancelSubscription(subId: string, donorName: string) {
  const db = createAdminClient()
  await db.from('subscriptions').update({ status: 'cancelled' }).eq('id', subId)
  await logAudit({
    action: 'cancel_subscription',
    entity: 'subscription',
    entityId: subId,
    entityLabel: donorName,
    before: { status: 'Ativa' },
    after: { status: 'Cancelada' },
  })
  revalidatePath('/admin/assinaturas')
}
