import { createClient } from '~/lib/supabase/server'
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

  await supabase.from('subscriptions').insert({
    donor_id: user.id,
    plan_value: planValue,
    joined_at: new Date().toISOString(),
  })

  redirect('/dashboard')
}
