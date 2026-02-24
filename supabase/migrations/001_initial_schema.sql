-- elevateHer Initial Schema
-- Multi-tenant B2B SaaS for returning mothers

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE public.app_role AS ENUM ('mom', 'talia_coach', 'manager', 'hr_admin');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Companies (Tenants)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  brand_primary_color TEXT DEFAULT '#7e22ce',
  brand_secondary_color TEXT DEFAULT '#faf5ff',
  logo_url TEXT,
  subscription_tier TEXT DEFAULT 'enterprise',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles (RBAC)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role public.app_role DEFAULT 'mom',
  department TEXT,
  return_date DATE,
  burnout_score INTEGER DEFAULT 0,
  assigned_coach_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles (Separate Table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Daily Pulses
CREATE TABLE public.daily_pulses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  date DATE DEFAULT CURRENT_DATE,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  blocker_tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Coaching Sessions
CREATE TABLE public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.profiles(id),
  mom_id UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Posts
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Replies
CREATE TABLE public.community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education Progress
CREATE TABLE public.education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track TEXT NOT NULL,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track, module_id)
);

-- Timeline Tasks
CREATE TABLE public.timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  week_title TEXT NOT NULL,
  task_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phase, week_title, task_text)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content (CMS)
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  author_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT,
  media_type TEXT,
  media_url TEXT,
  target_phase TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_url TEXT,
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Toolkit Data
CREATE TABLE public.career_toolkit_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_type)
);

-- AI Conversations
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  scenario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotional Checkins
CREATE TABLE public.emotional_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feeling_category TEXT NOT NULL,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  ai_response TEXT,
  exercises JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = _user_id
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_pulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_toolkit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT TO authenticated
  USING (id = public.get_user_company_id(auth.uid()));

-- Profiles
CREATE POLICY "Users can view profiles in their company" ON public.profiles
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Daily Pulses (PRIVATE)
CREATE POLICY "Users can view own pulses" ON public.daily_pulses
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pulses" ON public.daily_pulses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pulses" ON public.daily_pulses
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Coaching Sessions
CREATE POLICY "Users can view relevant coaching sessions" ON public.coaching_sessions
  FOR SELECT TO authenticated
  USING (
    mom_id = auth.uid()
    OR coach_id = auth.uid()
    OR (company_id = public.get_user_company_id(auth.uid())
        AND public.has_role(auth.uid(), 'hr_admin'))
  );
CREATE POLICY "Users can insert coaching sessions" ON public.coaching_sessions
  FOR INSERT TO authenticated WITH CHECK (mom_id = auth.uid());

-- Audit Logs
CREATE POLICY "HR admins can view company audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'hr_admin'));

-- Community Posts
CREATE POLICY "Company members can view community posts" ON public.community_posts
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Users can create community posts" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE TO authenticated USING (author_id = auth.uid());

-- Community Replies
CREATE POLICY "Users can view replies in their company" ON public.community_replies
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = post_id AND p.company_id = public.get_user_company_id(auth.uid())));
CREATE POLICY "Users can create replies" ON public.community_replies
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

-- Education Progress (PRIVATE)
CREATE POLICY "Users can view own education progress" ON public.education_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own education progress" ON public.education_progress
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Timeline Tasks (PRIVATE)
CREATE POLICY "Users can view own timeline tasks" ON public.timeline_tasks
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own timeline tasks" ON public.timeline_tasks
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Notifications (PRIVATE)
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Content
CREATE POLICY "HR admins can manage content" ON public.content
  FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()) AND public.has_role(auth.uid(), 'hr_admin'));
CREATE POLICY "Employees can view published content" ON public.content
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()) AND published = true);

-- Resources
CREATE POLICY "Users can view company resources" ON public.resources
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

-- Career Toolkit Data (PRIVATE)
CREATE POLICY "Users can view own toolkit data" ON public.career_toolkit_data
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own toolkit data" ON public.career_toolkit_data
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- AI Conversations (STRICTLY PRIVATE)
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Emotional Checkins (STRICTLY PRIVATE)
CREATE POLICY "Users can view own checkins" ON public.emotional_checkins
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own checkins" ON public.emotional_checkins
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'mom'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'mom');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Notify on content publish
CREATE OR REPLACE FUNCTION public.notify_on_content_publish()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND (OLD.published IS NULL OR OLD.published = false) THEN
    INSERT INTO public.notifications (user_id, company_id, type, title, body, link)
    SELECT p.id, NEW.company_id, 'content',
           'New content: ' || NEW.title,
           'New ' || COALESCE(NEW.media_type, 'content') || ' available in your Content Feed',
           '/content-feed'
    FROM public.profiles p
    WHERE p.company_id = NEW.company_id AND p.role = 'mom';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_content_publish
  AFTER INSERT OR UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_content_publish();

-- Notify on coaching session booking
CREATE OR REPLACE FUNCTION public.notify_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, company_id, type, title, body, link)
  VALUES (
    NEW.coach_id, NEW.company_id, 'coaching',
    'New coaching session booked',
    'A session has been scheduled for ' || to_char(NEW.scheduled_at, 'Mon DD, YYYY at HH:MI AM'),
    '/expert'
  );
  INSERT INTO public.notifications (user_id, company_id, type, title, body, link)
  VALUES (
    NEW.mom_id, NEW.company_id, 'booking',
    'Coaching session confirmed',
    'Your session is scheduled for ' || to_char(NEW.scheduled_at, 'Mon DD, YYYY at HH:MI AM'),
    '/coaching'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_booked
  AFTER INSERT ON public.coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_booking();
