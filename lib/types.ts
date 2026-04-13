export type DonorStatus = 'active' | 'inactive'
export type PaymentStatus = 'pending' | 'paid'
export type PlanValue = 5 | 10 | 15 | 50 | 100

export interface Donor {
  id: string
  name: string
  email: string
  whatsapp?: string
  cpf?: string
  status: DonorStatus
  asaas_customer_id?: string
  created_at: string
}

export interface Subscription {
  id: string
  donor_id: string
  plan_value: PlanValue
  joined_at: string
  status: 'active' | 'cancelled'
  asaas_subscription_id?: string
  billing_type?: string
  donor?: Donor
}

export interface Payment {
  id: string
  subscription_id: string
  reference_month: string // YYYY-MM
  status: PaymentStatus
  paid_at: string | null
  created_at: string
  asaas_payment_id?: string
  asaas_invoice_url?: string
  subscription?: Subscription & { donor?: Donor }
}

export interface Document {
  id: string
  title: string
  description?: string
  file_url: string
  file_type: 'pdf' | 'image' | 'video'
  created_at: string
}
