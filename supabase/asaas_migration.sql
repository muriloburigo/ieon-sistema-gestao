-- ============================================================
-- IEON — Asaas Integration Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add status column to subscriptions (needed for cancel logic)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'cancelled'));

-- Add Asaas fields to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS asaas_subscription_id text,
  ADD COLUMN IF NOT EXISTS billing_type text DEFAULT 'UNDEFINED';

-- Add CPF and Asaas customer ID to donors
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS asaas_customer_id text;

-- Add Asaas fields to payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS asaas_payment_id text,
  ADD COLUMN IF NOT EXISTS asaas_invoice_url text;

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas_id
  ON public.subscriptions (asaas_subscription_id);

CREATE INDEX IF NOT EXISTS idx_payments_asaas_id
  ON public.payments (asaas_payment_id);
