import { createClient, createAdminClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PlanValue } from '~/lib/types'

const VALID_PLANS: PlanValue[] = [5, 10, 15, 50, 100]

export async function POST(request: Request) {
  const formData = await request.formData()
  const planValue = Number(formData.get('plan_value')) as PlanValue

  if (!VALID_PLANS.includes(planValue)) redirect('/dashboard')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()
  await db.from('subscriptions').insert({
    donor_id: user.id,
    plan_value: planValue,
    joined_at: new Date().toISOString(),
    status: 'pending',
  })

  redirect('/dashboard')
}
