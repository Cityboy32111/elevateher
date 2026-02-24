-- elevateHer Phase 9-13 Migration
-- Therapist infrastructure, clinical records, consent, invitations, billing

-- ============================================================================
-- 1. ADD THERAPIST ROLE
-- ============================================================================
ALTER TYPE public.app_role ADD VALUE 'therapist';

-- ============================================================================
-- 2. ADD STATE COLUMN TO PROFILES
-- ============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- ============================================================================
-- 3. THERAPIST LICENSES
-- ============================================================================
CREATE TABLE public.therapist_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  license_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  state TEXT NOT NULL,
  expires_on DATE NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.profiles(id),
  malpractice_insurance_url TEXT,
  license_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.therapist_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view own licenses" ON public.therapist_licenses
  FOR SELECT TO authenticated USING (therapist_id = auth.uid());

CREATE POLICY "Therapists can insert own licenses" ON public.therapist_licenses
  FOR INSERT TO authenticated WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Therapists can update own licenses" ON public.therapist_licenses
  FOR UPDATE TO authenticated USING (therapist_id = auth.uid());

-- ============================================================================
-- 4. THERAPIST AVAILABILITY
-- ============================================================================
CREATE TABLE public.therapist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage own availability" ON public.therapist_availability
  FOR ALL TO authenticated USING (therapist_id = auth.uid());

CREATE POLICY "Authenticated users can view availability" ON public.therapist_availability
  FOR SELECT TO authenticated USING (is_active = true);

-- ============================================================================
-- 5. THERAPY NOTES (STRICTLY PRIVATE TO AUTHORING THERAPIST)
-- ============================================================================
CREATE TABLE public.therapy_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.coaching_sessions(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES public.profiles(id) NOT NULL,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'session',
  content TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.therapy_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only the authoring therapist can view notes" ON public.therapy_notes
  FOR SELECT TO authenticated USING (therapist_id = auth.uid());

CREATE POLICY "Only the authoring therapist can insert notes" ON public.therapy_notes
  FOR INSERT TO authenticated WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Only the authoring therapist can update unlocked notes" ON public.therapy_notes
  FOR UPDATE TO authenticated USING (therapist_id = auth.uid() AND is_locked = false);

-- ============================================================================
-- 6. CONSENT RECORDS
-- ============================================================================
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consent_text TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent records" ON public.consent_records
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consent records" ON public.consent_records
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 7. COMPANY INVITATIONS
-- ============================================================================
CREATE TABLE public.company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'mom',
  invited_by UUID REFERENCES public.profiles(id),
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR admins can manage invitations for their company" ON public.company_invitations
  FOR ALL TO authenticated USING (
    company_id = public.get_user_company_id(auth.uid())
    AND public.has_role(auth.uid(), 'hr_admin')
  );

CREATE POLICY "Users can view invitation by token" ON public.company_invitations
  FOR SELECT TO authenticated USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- ============================================================================
-- 8. SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_name TEXT NOT NULL DEFAULT 'enterprise',
  status TEXT NOT NULL DEFAULT 'trialing',
  seats_included INTEGER DEFAULT 10,
  price_per_year INTEGER DEFAULT 70000,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR admins can view their company subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (
    company_id = public.get_user_company_id(auth.uid())
    AND public.has_role(auth.uid(), 'hr_admin')
  );

-- ============================================================================
-- 9. THERAPIST PAYOUTS
-- ============================================================================
CREATE TABLE public.therapist_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES public.profiles(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  sessions_completed INTEGER DEFAULT 0,
  rate_per_session INTEGER DEFAULT 200,
  total_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(therapist_id, period_start)
);

ALTER TABLE public.therapist_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view own payouts" ON public.therapist_payouts
  FOR SELECT TO authenticated USING (therapist_id = auth.uid());

-- ============================================================================
-- 10. FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.therapist_eligible_for_state(
  _therapist_id UUID,
  _state TEXT
) RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM public.therapist_licenses
  WHERE therapist_id = _therapist_id
  AND state = _state
  AND verified = true
  AND expires_on > CURRENT_DATE
)
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.calculate_monthly_payout(
  _therapist_id UUID,
  _period_start DATE,
  _period_end DATE
) RETURNS INTEGER AS $$
DECLARE
  session_count INTEGER;
  total INTEGER;
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM public.coaching_sessions
  WHERE coach_id = _therapist_id
  AND status = 'completed'
  AND scheduled_at >= _period_start::TIMESTAMP WITH TIME ZONE
  AND scheduled_at < (_period_end + INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE;

  total := session_count * 200;

  INSERT INTO public.therapist_payouts (
    therapist_id, period_start, period_end,
    sessions_completed, rate_per_session, total_amount, status
  ) VALUES (
    _therapist_id, _period_start, _period_end,
    session_count, 200, total, 'pending'
  )
  ON CONFLICT (therapist_id, period_start)
  DO UPDATE SET
    sessions_completed = session_count,
    total_amount = total,
    updated_at = NOW();

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
