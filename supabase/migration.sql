-- ============================================================
-- IEON — Instituto Endurance On
-- Migration inicial
-- ============================================================

-- Donors (extends auth.users)
CREATE TABLE IF NOT EXISTS public.donors (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text NOT NULL,
  whatsapp    text,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_admin    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id    uuid NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  plan_value  integer NOT NULL CHECK (plan_value IN (5, 10, 15, 50, 100)),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (donor_id) -- um doador = uma assinatura ativa
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id  uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  reference_month  text NOT NULL, -- YYYY-MM
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, reference_month)
);

-- Documents (prestação de contas)
CREATE TABLE IF NOT EXISTS public.documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  file_url    text NOT NULL,
  file_type   text NOT NULL CHECK (file_type IN ('pdf', 'image', 'video')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Donors: can read/update own row; admin reads all
CREATE POLICY "donors_own" ON public.donors FOR ALL USING (auth.uid() = id);
CREATE POLICY "donors_admin_read" ON public.donors FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.donors WHERE id = auth.uid() AND is_admin = true));

-- Subscriptions: own + admin
CREATE POLICY "subscriptions_own" ON public.subscriptions FOR ALL
  USING (donor_id = auth.uid());
CREATE POLICY "subscriptions_admin" ON public.subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.donors WHERE id = auth.uid() AND is_admin = true));

-- Payments: own + admin
CREATE POLICY "payments_own" ON public.payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.subscriptions WHERE id = subscription_id AND donor_id = auth.uid()));
CREATE POLICY "payments_admin" ON public.payments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.donors WHERE id = auth.uid() AND is_admin = true));

-- Documents: all authenticated can read; admin can write
CREATE POLICY "documents_read" ON public.documents FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "documents_admin_write" ON public.documents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.donors WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- Trigger: cria perfil donor ao criar usuário auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.donors (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Função: gerar lançamentos mensais (chamar via cron no dia 1)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_monthly_payments()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_month text := to_char(now(), 'YYYY-MM');
BEGIN
  INSERT INTO public.payments (subscription_id, reference_month, status)
  SELECT s.id, current_month, 'pending'
  FROM public.subscriptions s
  JOIN public.donors d ON d.id = s.donor_id
  WHERE d.status = 'active'
  ON CONFLICT (subscription_id, reference_month) DO NOTHING;
END;
$$;

-- ============================================================
-- Storage bucket para documentos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "documents_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');
CREATE POLICY "documents_admin_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM public.donors WHERE id = auth.uid() AND is_admin = true)
  );
