"use client";

import * as React from "react";
import Link from "next/link";
import { Map, Heart, BookOpen, MessageCircle, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { PhaseBadge, type PhaseNumber } from "@/components/phase-badge";
import { RiskIndicator, type RiskTier } from "@/components/risk-indicator";
import { formatDate } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface UserData {
  name: string;
  email: string;
  profile?: {
    currentPhase: number;
    currentWeek: number;
  } | null;
}

interface JourneyData {
  phase: {
    number: number;
    name: string;
    description: string;
  };
  currentWeek: number;
  weekTemplate: {
    theme: string;
    blocks: Array<{
      contentBlock: {
        type: string;
        title: string;
      };
    }>;
  } | null;
  weekProgress: {
    actionDone: boolean;
    scriptSaved: boolean;
    reflectionText: string | null;
    checkInDone: boolean;
    completedAt: string | null;
  } | null;
}

interface CheckInData {
  id: string;
  weekNumber: number;
  mood: number;
  energy: number;
  createdAt: string;
}

interface CoachingSessionData {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  coach: {
    bio: string;
    specialties: string[];
  };
}

interface RiskScoreData {
  tier: RiskTier;
  score: number;
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const [user, setUser] = React.useState<UserData | null>(null);
  const [journey, setJourney] = React.useState<JourneyData | null>(null);
  const [checkIns, setCheckIns] = React.useState<CheckInData[]>([]);
  const [coachingSessions, setCoachingSessions] = React.useState<CoachingSessionData[]>([]);
  const [riskScore, setRiskScore] = React.useState<RiskScoreData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const [userRes, journeyRes, checkInRes, coachingRes] = await Promise.allSettled([
          fetch("/api/auth/me"),
          fetch("/api/journey"),
          fetch("/api/checkin"),
          fetch("/api/coaching/sessions"),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.ok) {
          const data = await userRes.value.json();
          setUser(data.user);
        }

        if (journeyRes.status === "fulfilled" && journeyRes.value.ok) {
          const data = await journeyRes.value.json();
          setJourney(data);
        }

        if (checkInRes.status === "fulfilled" && checkInRes.value.ok) {
          const data = await checkInRes.value.json();
          setCheckIns(data.checkIns ?? []);

          // If there are check-ins, get the most recent risk score
          if (data.checkIns?.length > 0) {
            const latestWeek = data.checkIns[0].weekNumber;
            // Risk score is embedded in check-in response or we can infer from mood/energy
            // For now we check if there's a recent risk score
            try {
              const riskRes = await fetch("/api/checkin");
              if (riskRes.ok) {
                const riskData = await riskRes.json();
                if (riskData.checkIns?.[0]) {
                  const latest = riskData.checkIns[0];
                  // Derive approximate tier from mood/energy averages
                  const avg = (latest.mood + latest.energy) / 2;
                  let tier: RiskTier = "low";
                  if (avg <= 1.5) tier = "critical";
                  else if (avg <= 2.5) tier = "high";
                  else if (avg <= 3.5) tier = "medium";
                  setRiskScore({ tier, score: avg });
                }
              }
            } catch {
              // Silently fail for risk score
            }
          }
        }

        if (coachingRes.status === "fulfilled" && coachingRes.value.ok) {
          const data = await coachingRes.value.json();
          setCoachingSessions(data.sessions ?? []);
        }
      } catch {
        // Individual fetches handle their own errors
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // Determine if the user has checked in this week
  const currentWeek = journey?.currentWeek ?? 1;
  const checkedInThisWeek = checkIns.some((c) => c.weekNumber === currentWeek);

  // Find next upcoming coaching session
  const upcomingSession = coachingSessions.find(
    (s) => new Date(s.scheduledAt) > new Date() && s.status !== "cancelled"
  );

  // Get first name for greeting
  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Current action from journey
  const currentAction = journey?.weekTemplate?.blocks?.find(
    (b) => b.contentBlock.type === "action"
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 rounded-lg bg-[#2D2D2D]/8" />
          <div className="mt-2 h-4 w-40 rounded-lg bg-[#2D2D2D]/5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-white border border-[#2D2D2D]/8 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-semibold text-[#2D2D2D]">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#2D2D2D]/50">
          {formatDate(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* ── Phase & Week ── */}
      {journey && (
        <div className="flex items-center gap-3">
          <PhaseBadge phase={journey.phase.number as PhaseNumber} />
          <Badge variant="neutral">Week {journey.currentWeek}</Badge>
        </div>
      )}

      {/* ── Primary Cards Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* This Week's Focus */}
        {journey?.weekTemplate && (
          <Card className="sm:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-[#7C9A82]" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#7C9A82]">
                    This Week&apos;s Focus
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[#2D2D2D]">
                  {journey.weekTemplate.theme}
                </h2>
                {currentAction && (
                  <p className="mt-2 text-sm text-[#2D2D2D]/60">
                    Action: {currentAction.contentBlock.title}
                  </p>
                )}
                {journey.weekProgress && !journey.weekProgress.completedAt && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {!journey.weekProgress.actionDone && (
                      <Badge variant="rose">Action pending</Badge>
                    )}
                    {!journey.weekProgress.scriptSaved && (
                      <Badge variant="blue">Script unsaved</Badge>
                    )}
                    {!journey.weekProgress.checkInDone && (
                      <Badge variant="warm">Check-in due</Badge>
                    )}
                  </div>
                )}
                {journey.weekProgress?.completedAt && (
                  <Badge variant="sage" className="mt-3">
                    Week complete
                  </Badge>
                )}
              </div>
              <Link href="/journey">
                <Button variant="secondary" size="sm">
                  View journey
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick Check-in Prompt */}
        {!checkedInThisWeek && (
          <Card className="border-[#C4A49A]/30 bg-[#C4A49A]/5">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-[#C4A49A]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#9A7B71]">
                Check-in
              </span>
            </div>
            <p className="text-sm font-medium text-[#2D2D2D]">
              How are you feeling this week?
            </p>
            <p className="mt-1 text-sm text-[#2D2D2D]/50">
              Takes about 60 seconds. Your answers stay private.
            </p>
            <Link href="/checkin" className="mt-3 inline-block">
              <Button size="sm">
                Start check-in
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>
        )}

        {/* Risk Indicator */}
        {riskScore && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#2D2D2D]/45">
                Wellbeing Pulse
              </span>
            </div>
            <RiskIndicator tier={riskScore.tier} />
          </Card>
        )}

        {/* Upcoming Coaching Session */}
        {upcomingSession && (
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-[#8BA4B8]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B8A9E]">
                Next Session
              </span>
            </div>
            <p className="text-sm font-medium text-[#2D2D2D]">
              {formatDate(upcomingSession.scheduledAt, "EEEE, MMM d")}
            </p>
            <p className="text-sm text-[#2D2D2D]/50">
              {formatDate(upcomingSession.scheduledAt, "h:mm a")} &middot; {upcomingSession.duration} min
            </p>
            <Link href="/coaching" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">
                View details
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2D2D2D]/45">
          Quick Links
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/journey">
            <Card className="flex flex-col items-center gap-2 py-6 hover:shadow-md transition-shadow cursor-pointer text-center">
              <Map className="h-6 w-6 text-[#7C9A82]" />
              <span className="text-sm font-medium text-[#2D2D2D]">Journey</span>
            </Card>
          </Link>
          <Link href="/toolkits">
            <Card className="flex flex-col items-center gap-2 py-6 hover:shadow-md transition-shadow cursor-pointer text-center">
              <BookOpen className="h-6 w-6 text-[#C4A49A]" />
              <span className="text-sm font-medium text-[#2D2D2D]">Toolkits</span>
            </Card>
          </Link>
          <Link href="/coaching">
            <Card className="flex flex-col items-center gap-2 py-6 hover:shadow-md transition-shadow cursor-pointer text-center">
              <MessageCircle className="h-6 w-6 text-[#8BA4B8]" />
              <span className="text-sm font-medium text-[#2D2D2D]">Coaching</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Recent Check-ins Summary ── */}
      {checkIns.length > 0 && (
        <Card title="Recent Check-ins">
          <div className="space-y-3">
            {checkIns.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b border-[#2D2D2D]/5 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-[#2D2D2D]">
                    Week {c.weekNumber}
                  </p>
                  <p className="text-xs text-[#2D2D2D]/45">
                    {formatDate(c.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#2D2D2D]/60">
                  <span>Mood: {c.mood}/5</span>
                  <span>Energy: {c.energy}/5</span>
                </div>
              </div>
            ))}
          </div>
          {checkIns.length > 3 && (
            <Link
              href="/checkin"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#7C9A82] hover:text-[#6B8971] transition-colors"
            >
              View all check-ins
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </Card>
      )}
    </div>
  );
}
