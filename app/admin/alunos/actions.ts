'use server'

import { createAdminClient } from '~/lib/supabase/server'
import { logAudit } from '~/lib/audit'
import { revalidatePath } from 'next/cache'

export async function toggleDonorStatus(donorId: string, currentStatus: string, donorName: string) {
  const next = currentStatus === 'active' ? 'inactive' : 'active'
  const db = createAdminClient()
  await db.from('donors').update({ status: next }).eq('id', donorId)
  await logAudit({
    action: 'toggle_donor_status',
    entity: 'donor',
    entityId: donorId,
    entityLabel: donorName,
    before: { status: currentStatus === 'active' ? 'Ativo' : 'Inadimplente' },
    after: { status: next === 'active' ? 'Ativo' : 'Inadimplente' },
  })
  revalidatePath('/admin/alunos')
}
