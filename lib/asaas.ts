// Asaas Payment Gateway — https://www.asaas.com/api
// Sandbox: https://sandbox.asaas.com/api/v3
// Production: https://api.asaas.com/api/v3

const BASE_URL =
  process.env.ASAAS_SANDBOX === 'false'
    ? 'https://api.asaas.com/api/v3'
    : 'https://sandbox.asaas.com/api/v3'

function apiKey() {
  const key = process.env.ASAAS_API_KEY
  if (!key) throw new Error('ASAAS_API_KEY não configurado.')
  return key
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: apiKey(),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Asaas ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────

export type AsaasBillingType = 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
export type AsaasPaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS'

export interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj: string
  mobilePhone?: string
  deleted: boolean
}

export interface AsaasSubscription {
  id: string
  customer: string
  billingType: AsaasBillingType
  value: number
  nextDueDate: string // YYYY-MM-DD
  cycle: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  externalReference?: string
  description?: string
  deleted: boolean
}

export interface AsaasPayment {
  id: string
  customer: string
  subscription?: string
  billingType: AsaasBillingType
  status: AsaasPaymentStatus
  value: number
  dueDate: string // YYYY-MM-DD
  paymentDate?: string // YYYY-MM-DD
  invoiceUrl: string
  bankSlipUrl?: string
  invoiceNumber?: string
  externalReference?: string
}

export interface AsaasWebhookPayload {
  event: string
  payment?: AsaasPayment
  subscription?: AsaasSubscription
}

// ─── Customers ────────────────────────────────────────────────

export async function createCustomer(data: {
  name: string
  email: string
  cpfCnpj: string
  mobilePhone?: string
}): Promise<AsaasCustomer> {
  return request<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function findCustomerByCpf(cpfCnpj: string): Promise<AsaasCustomer | null> {
  const res = await request<{ data: AsaasCustomer[] }>(`/customers?cpfCnpj=${cpfCnpj}`)
  return res.data.find(c => !c.deleted) ?? null
}

export async function getOrCreateCustomer(data: {
  name: string
  email: string
  cpfCnpj: string
  mobilePhone?: string
}): Promise<AsaasCustomer> {
  const existing = await findCustomerByCpf(data.cpfCnpj)
  if (existing) return existing
  return createCustomer(data)
}

// ─── Subscriptions ────────────────────────────────────────────

export async function createSubscription(data: {
  customer: string
  billingType: AsaasBillingType
  value: number
  nextDueDate: string // YYYY-MM-DD
  cycle: 'MONTHLY'
  description?: string
  externalReference?: string
}): Promise<AsaasSubscription> {
  return request<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return request<AsaasSubscription>(`/subscriptions/${subscriptionId}`)
}

export async function cancelAsaasSubscription(subscriptionId: string): Promise<void> {
  await request(`/subscriptions/${subscriptionId}`, { method: 'DELETE' })
}

export async function getSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
  const res = await request<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscriptionId}/payments?limit=10&offset=0`
  )
  return res.data
}

// ─── Payments ─────────────────────────────────────────────────

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return request<AsaasPayment>(`/payments/${paymentId}`)
}

export async function getPaymentPixQrCode(
  paymentId: string
): Promise<{ encodedImage: string; payload: string; expirationDate: string }> {
  return request(`/payments/${paymentId}/pixQrCode`)
}

// ─── Helpers ──────────────────────────────────────────────────

/** Returns the next due date (10th of current or next month) */
export function getNextDueDate(): string {
  const now = new Date()
  const day10 = new Date(now.getFullYear(), now.getMonth(), 10)
  const target = now <= day10 ? day10 : new Date(now.getFullYear(), now.getMonth() + 1, 10)
  return target.toISOString().slice(0, 10)
}

/** Returns true if ASAAS_API_KEY is configured */
export function isAsaasConfigured(): boolean {
  return Boolean(process.env.ASAAS_API_KEY)
}
