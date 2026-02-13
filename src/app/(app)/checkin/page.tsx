"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button, Card, Textarea, ScaleInput, Toggle } from "@/components/ui";
import { RiskIndicator, type RiskTier } from "@/components/risk-indicator";
import Link from "next/link";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface CheckInResult {
  checkIn: {
    id: string;
    weekNumber: number;
    mood: number;
    energy: number;
    sleepQuality: number;
    stress: number;
  };
  riskScore: {
    tier: RiskTier;
    score: number;
    factors: string;
  };
  triggerEvent: {
    action: string;
  } | null;
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function CheckInPage() {
  const router = useRouter();

  // Form state
  const [mood, setMood] = React.useState<number | null>(null);
  const [energy, setEnergy] = React.useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = React.useState<number | null>(null);
  const [stress, setStress] = React.useState<number | null>(null);
  const [workloadManageable, setWorkloadManageable] = React.useState(true);
  const [managerSupportPresent, setManagerSupportPresent] = React.useState(true);
  const [childcareStable, setChildcareStable] = React.useState(true);
  const [performanceAnxiety, setPerformanceAnxiety] = React.useState(false);
  const [hardestThisWeek, setHardestThisWeek] = React.useState("");

  // UI state
  const [currentWeek, setCurrentWeek] = React.useState<number>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<CheckInResult | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  // Load current week from journey
  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/journey");
        if (res.ok) {
          const data = await res.json();
          setCurrentWeek(data.currentWeek ?? 1);
        }
      } catch {
        // Default to week 1
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate scales are filled
    if (mood === null || energy === null || sleepQuality === null || stress === null) {
      setError("Please answer all the scale questions before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: currentWeek,
          mood,
          energy,
          sleepQuality,
          stress,
          workloadManageable,
          managerSupportPresent,
          childcareStable,
          performanceAnxiety,
          hardestThisWeek: hardestThisWeek.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data);

      // Also mark check-in done in journey progress
      try {
        await fetch("/api/journey/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "checkInDone", value: true }),
        });
      } catch {
        // Non-critical
      }
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Result View ──
  if (result) {
    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#7C9A82]/10 mb-4">
            <CheckCircle2 className="h-7 w-7 text-[#7C9A82]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">
            Check-in complete
          </h1>
          <p className="mt-2 text-sm text-[#2D2D2D]/55">
            Thank you for taking a moment for yourself. Here&apos;s your summary.
          </p>
        </div>

        {/* Summary */}
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#2D2D2D]/45 mb-4">
            Week {result.checkIn.weekNumber} Summary
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="rounded-lg bg-[#FAF7F2] p-3 text-center">
              <p className="text-2xl font-semibold text-[#2D2D2D]">{result.checkIn.mood}</p>
              <p className="text-xs text-[#2D2D2D]/50 mt-0.5">Mood</p>
            </div>
            <div className="rounded-lg bg-[#FAF7F2] p-3 text-center">
              <p className="text-2xl font-semibold text-[#2D2D2D]">{result.checkIn.energy}</p>
              <p className="text-xs text-[#2D2D2D]/50 mt-0.5">Energy</p>
            </div>
            <div className="rounded-lg bg-[#FAF7F2] p-3 text-center">
              <p className="text-2xl font-semibold text-[#2D2D2D]">{result.checkIn.sleepQuality}</p>
              <p className="text-xs text-[#2D2D2D]/50 mt-0.5">Sleep</p>
            </div>
            <div className="rounded-lg bg-[#FAF7F2] p-3 text-center">
              <p className="text-2xl font-semibold text-[#2D2D2D]">{result.checkIn.stress}</p>
              <p className="text-xs text-[#2D2D2D]/50 mt-0.5">Stress</p>
            </div>
          </div>

          <div className="border-t border-[#2D2D2D]/8 pt-4">
            <h4 className="text-sm font-semibold text-[#2D2D2D]/60 mb-2">
              Wellbeing Pulse
            </h4>
            <RiskIndicator tier={result.riskScore.tier} />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button variant="primary" className="w-full sm:w-auto">
              Back to dashboard
            </Button>
          </Link>
          <Link href="/journey">
            <Button variant="secondary" className="w-full sm:w-auto">
              View journey
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loadingProfile) {
    return (
      <div className="flex flex-col gap-6 max-w-lg mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-[#2D2D2D]/8" />
          <div className="mt-2 h-4 w-72 rounded-lg bg-[#2D2D2D]/5" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-white border border-[#2D2D2D]/8 animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Check-in Form ──
  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#2D2D2D]/50 hover:text-[#2D2D2D]/70 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C4A49A]/15">
            <Heart className="h-5 w-5 text-[#C4A49A]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#2D2D2D]">
              Weekly Check-in
            </h1>
            <p className="text-sm text-[#2D2D2D]/50">
              60 seconds to check in with yourself
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg bg-[#C4605A]/8 px-4 py-3 text-sm text-[#C4605A]">
            {error}
          </div>
        )}

        {/* Scale Questions */}
        <Card>
          <div className="flex flex-col gap-6">
            <ScaleInput
              label="How is your mood?"
              value={mood}
              onChange={setMood}
              labels={["Very low", "Low", "Okay", "Good", "Great"]}
            />

            <ScaleInput
              label="How is your energy level?"
              value={energy}
              onChange={setEnergy}
              labels={["Exhausted", "Low", "Moderate", "Good", "Energized"]}
            />

            <ScaleInput
              label="How is your sleep quality?"
              value={sleepQuality}
              onChange={setSleepQuality}
              labels={["Terrible", "Poor", "Fair", "Good", "Excellent"]}
            />

            <ScaleInput
              label="How stressed do you feel?"
              value={stress}
              onChange={setStress}
              labels={["Not at all", "A little", "Somewhat", "Very", "Overwhelmed"]}
            />
          </div>
        </Card>

        {/* Toggle Questions */}
        <Card>
          <p className="text-sm font-semibold text-[#2D2D2D]/70 mb-4">
            Quick yes/no
          </p>
          <div className="flex flex-col gap-4">
            <Toggle
              label="My workload feels manageable"
              checked={workloadManageable}
              onChange={setWorkloadManageable}
            />
            <Toggle
              label="I feel supported by my manager"
              checked={managerSupportPresent}
              onChange={setManagerSupportPresent}
            />
            <Toggle
              label="My childcare situation is stable"
              checked={childcareStable}
              onChange={setChildcareStable}
            />
            <Toggle
              label="I feel anxious about my performance"
              checked={performanceAnxiety}
              onChange={setPerformanceAnxiety}
            />
          </div>
        </Card>

        {/* Open-ended */}
        <Card>
          <Textarea
            label="What's been hardest this week?"
            placeholder="This is optional, but sharing can help us personalize your experience..."
            value={hardestThisWeek}
            onChange={(e) => setHardestThisWeek(e.target.value)}
            rows={3}
          />
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || mood === null || energy === null || sleepQuality === null || stress === null}
        >
          {submitting ? "Submitting..." : "Submit check-in"}
        </Button>

        <p className="text-center text-xs text-[#2D2D2D]/40">
          Your answers are private and only used to personalize your journey.
        </p>
      </form>
    </div>
  );
}
