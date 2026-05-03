-- TeleMed Database Schema
-- Migration 001: Initial schema setup

-- ============================================================
-- Users table (synced from Clerk via webhook)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'professional', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Professionals table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_document_url TEXT,
  bio TEXT,
  years_experience INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  consultation_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Professional Availability
-- ============================================================
CREATE TABLE IF NOT EXISTS public.professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- Consultations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  daily_room_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Prescriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  instructions TEXT,
  valid_until DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- ============================================================
-- Payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  stripe_payment_intent_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'consultation', 'medication')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX idx_professionals_status ON public.professionals(status);
CREATE INDEX idx_professionals_specialty ON public.professionals(specialty);

CREATE INDEX idx_availability_professional ON public.professional_availability(professional_id);

CREATE INDEX idx_consultations_patient ON public.consultations(patient_id);
CREATE INDEX idx_consultations_professional ON public.consultations(professional_id);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_scheduled ON public.consultations(scheduled_at);

CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_professional ON public.prescriptions(professional_id);
CREATE INDEX idx_prescriptions_consultation ON public.prescriptions(consultation_id);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users: Service role can do all operations
CREATE POLICY "Service role full access users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Professionals: Anyone can read active professionals
CREATE POLICY "Anyone can read active professionals" ON public.professionals
  FOR SELECT USING (status = 'active');

-- Professionals: Service role full access
CREATE POLICY "Service role full access professionals" ON public.professionals
  FOR ALL USING (true) WITH CHECK (true);

-- Availability: Anyone can read
CREATE POLICY "Anyone can read availability" ON public.professional_availability
  FOR SELECT USING (true);

-- Availability: Service role full access
CREATE POLICY "Service role full access availability" ON public.professional_availability
  FOR ALL USING (true) WITH CHECK (true);

-- Consultations: Users can read their own
CREATE POLICY "Users can read own consultations" ON public.consultations
  FOR SELECT USING (auth.uid()::text = patient_id::text);

-- Consultations: Service role full access
CREATE POLICY "Service role full access consultations" ON public.consultations
  FOR ALL USING (true) WITH CHECK (true);

-- Prescriptions: Users can read their own
CREATE POLICY "Users can read own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid()::text = patient_id::text);

-- Prescriptions: Service role full access
CREATE POLICY "Service role full access prescriptions" ON public.prescriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Subscriptions: Users can read own
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Subscriptions: Service role full access
CREATE POLICY "Service role full access subscriptions" ON public.subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Payments: Users can read own
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Payments: Service role full access
CREATE POLICY "Service role full access payments" ON public.payments
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Storage bucket for prescriptions and documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can read their own prescriptions
CREATE POLICY "Users can read own prescription files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prescriptions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage: Service role full access
CREATE POLICY "Service role full access storage" ON storage.objects
  FOR ALL USING (true) WITH CHECK (true);
