export type AppRole = "mom" | "talia_coach" | "manager" | "hr_admin";

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  brand_primary_color: string;
  brand_secondary_color: string;
  logo_url: string | null;
  subscription_tier: string;
  created_at: string;
}

export interface Profile {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: AppRole;
  department: string | null;
  return_date: string | null;
  burnout_score: number;
  assigned_coach_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyPulse {
  id: string;
  user_id: string;
  company_id: string | null;
  date: string;
  mood_score: number;
  stress_level: number | null;
  blocker_tags: string[] | null;
  notes: string | null;
  created_at: string;
}

export interface CoachingSession {
  id: string;
  coach_id: string;
  mom_id: string;
  company_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  created_at: string;
  coach?: Profile;
  mom?: Profile;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  company_id: string | null;
  category: string;
  title: string;
  body: string;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: CommunityReply[];
}

export interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  is_anonymous: boolean;
  created_at: string;
  author?: Profile;
}

export interface EducationProgress {
  id: string;
  user_id: string;
  track: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface TimelineTask {
  id: string;
  user_id: string;
  phase: string;
  week_title: string;
  task_text: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  company_id: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Content {
  id: string;
  company_id: string | null;
  author_id: string | null;
  title: string;
  body: string | null;
  media_type: string | null;
  media_url: string | null;
  target_phase: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
}

export interface CareerToolkitData {
  id: string;
  user_id: string;
  tool_type: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  scenario: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmotionalCheckin {
  id: string;
  user_id: string;
  feeling_category: string;
  intensity: number;
  ai_response: string | null;
  exercises: Record<string, unknown>[] | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  company_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
