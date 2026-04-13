'use server'

import { createAdminClient, createClient } from './supabase/server'

type AuditParams = {
  action: string
  entity: string
  entityId?: string
  entityLabel?: string
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
}

export async function logAudit(params: AuditParams) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return

    const db = createAdminClient()
    const { data: admin } = await db
      .from('donors')
      .select('name, email')
      .eq('id', user.id)
      .single()

    await db.from('audit_logs').insert({
      admin_id: user.id,
      admin_name: admin?.name ?? 'Desconhecido',
      admin_email: admin?.email ?? user.email,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId ?? null,
      entity_label: params.entityLabel ?? null,
      before_data: params.before ?? null,
      after_data: params.after ?? null,
    })
  } catch {
    // Nunca quebrar a operação principal por falha no log
  }
}
