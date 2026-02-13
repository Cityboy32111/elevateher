"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Circle,
  Sparkles,
  MessageSquareText,
  PenLine,
  BookOpen,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button, Card, ProgressBar, Textarea, Badge } from "@/components/ui";
import { PhaseBadge, type PhaseNumber } from "@/components/phase-badge";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface ContentBlock {
  id: string;
  type: string;
  title: string;
  body: string | null;
  tips: string | null;
}

interface WeekBlock {
  id: string;
  position: number;
  contentBlock: ContentBlock;
}

interface WeekTemplate {
  id: string;
  weekNumber: number;
  theme: string;
  blocks: WeekBlock[];
}

interface WeekProgress {
  id: string;
  actionDone: boolean;
  scriptSaved: boolean;
  reflectionText: string | null;
  checkInDone: boolean;
  completedAt: string | null;
}

interface JourneyData {
  phase: {
    number: number;
    name: string;
    description: string;
  };
  currentWeek: number;
  weekTemplate: WeekTemplate | null;
  weekProgress: WeekProgress | null;
}

/* ---------------------------------------------------------------------------
 * Content type icon mapping
 * -------------------------------------------------------------------------- */

const typeIcons: Record<string, React.ElementType> = {
  lesson: BookOpen,
  action: Sparkles,
  script: MessageSquareText,
  reflection: PenLine,
};

function getIcon(type: string) {
  return typeIcons[type] ?? BookOpen;
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function JourneyPage() {
  const [journey, setJourney] = React.useState<JourneyData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Local progress state (optimistic)
  const [actionDone, setActionDone] = React.useState(false);
  const [scriptSaved, setScriptSaved] = React.useState(false);
  const [reflectionText, setReflectionText] = React.useState("");
  const [reflectionDirty, setReflectionDirty] = React.useState(false);

  // Saving indicators
  const [savingField, setSavingField] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);

  // Expanded content blocks
  const [expandedBlocks, setExpandedBlocks] = React.useState<Set<string>>(new Set());

  // Past weeks toggle
  const [showPastWeeks, setShowPastWeeks] = React.useState(false);

  React.useEffect(() => {
    async function loadJourney() {
      try {
        const res = await fetch("/api/journey");
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Could not load your journey.");
          return;
        }
        const data: JourneyData = await res.json();
        setJourney(data);

        // Sync local state with server progress
        if (data.weekProgress) {
          setActionDone(data.weekProgress.actionDone);
          setScriptSaved(data.weekProgress.scriptSaved);
          setReflectionText(data.weekProgress.reflectionText ?? "");
        }
      } catch {
        setError("Unable to connect. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    loadJourney();
  }, []);

  // Save a progress field to the API
  async function saveProgress(field: string, value: boolean | string) {
    setSavingField(field);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/journey/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });

      if (res.ok) {
        setSaveSuccess(field);
        setTimeout(() => setSaveSuccess(null), 2000);
      }
    } catch {
      // Revert on failure
      if (field === "actionDone") setActionDone(!value);
      if (field === "scriptSaved") setScriptSaved(!value);
    } finally {
      setSavingField(null);
    }
  }

  function toggleBlock(blockId: string) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  }

  function handleToggleAction() {
    const newValue = !actionDone;
    setActionDone(newValue);
    saveProgress("actionDone", newValue);
  }

  function handleToggleScript() {
    const newValue = !scriptSaved;
    setScriptSaved(newValue);
    saveProgress("scriptSaved", newValue);
  }

  function handleSaveReflection() {
    saveProgress("reflectionText", reflectionText);
    setReflectionDirty(false);
  }

  // Calculate overall progress
  const currentWeek = journey?.currentWeek ?? 1;
  const overallProgress = Math.round((currentWeek / 52) * 100);

  // Determine completed items count
  const completedItems = [actionDone, scriptSaved, !!reflectionText, journey?.weekProgress?.checkInDone].filter(Boolean).length;
  const totalItems = 4;

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-[#2D2D2D]/8" />
          <div className="mt-2 h-4 w-72 rounded-lg bg-[#2D2D2D]/5" />
        </div>
        <div className="h-4 rounded-full bg-[#2D2D2D]/8 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-white border border-[#2D2D2D]/8 animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-[#2D2D2D]/55">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!journey) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#2D2D2D]/50 hover:text-[#2D2D2D]/70 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-[#2D2D2D]">
              Your Journey
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <PhaseBadge phase={journey.phase.number as PhaseNumber} />
              <Badge variant="neutral">Week {currentWeek} of 52</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overall Progress ── */}
      <Card>
        <ProgressBar
          value={overallProgress}
          label="Overall Journey Progress"
          showValue
        />
        <p className="mt-2 text-xs text-[#2D2D2D]/45">
          {journey.phase.name} &mdash; {journey.phase.description}
        </p>
      </Card>

      {/* ── Current Week ── */}
      {journey.weekTemplate && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2D2D2D]">
              Week {currentWeek}: {journey.weekTemplate.theme}
            </h2>
            <span className="text-sm text-[#2D2D2D]/45">
              {completedItems}/{totalItems} done
            </span>
          </div>

          {/* Content Blocks */}
          <div className="flex flex-col gap-3">
            {journey.weekTemplate.blocks.map((block) => {
              const Icon = getIcon(block.contentBlock.type);
              const isExpanded = expandedBlocks.has(block.id);
              const isAction = block.contentBlock.type === "action";
              const isScript = block.contentBlock.type === "script";
              const isReflection = block.contentBlock.type === "reflection";

              const isDone =
                (isAction && actionDone) ||
                (isScript && scriptSaved);

              return (
                <Card
                  key={block.id}
                  className={cn(
                    isDone && "border-[#7C9A82]/25 bg-[#7C9A82]/3"
                  )}
                >
                  {/* Block header */}
                  <button
                    type="button"
                    onClick={() => toggleBlock(block.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    {isDone ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C9A82] text-white">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2D2D2D]/6">
                        <Icon className="h-4 w-4 text-[#2D2D2D]/45" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#2D2D2D]/40">
                        {block.contentBlock.type}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isDone ? "text-[#2D2D2D]/50 line-through decoration-[#2D2D2D]/15" : "text-[#2D2D2D]"
                        )}
                      >
                        {block.contentBlock.title}
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[#2D2D2D]/35" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#2D2D2D]/35" />
                    )}
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 pl-11">
                      {block.contentBlock.body && (
                        <p className="text-sm text-[#2D2D2D]/70 whitespace-pre-line leading-relaxed">
                          {block.contentBlock.body}
                        </p>
                      )}

                      {block.contentBlock.tips && (
                        <div className="mt-3 rounded-lg bg-[#FAF7F2] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#D4A574] mb-1">
                            Tips
                          </p>
                          <p className="text-sm text-[#2D2D2D]/60 whitespace-pre-line">
                            {block.contentBlock.tips}
                          </p>
                        </div>
                      )}

                      {/* Action toggle */}
                      {isAction && (
                        <div className="mt-4">
                          <Button
                            variant={actionDone ? "ghost" : "primary"}
                            size="sm"
                            onClick={handleToggleAction}
                            disabled={savingField === "actionDone"}
                          >
                            {actionDone ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Circle className="h-3.5 w-3.5" />
                                Mark as done
                              </>
                            )}
                          </Button>
                          {saveSuccess === "actionDone" && (
                            <span className="ml-2 text-xs text-[#7C9A82]">Saved</span>
                          )}
                        </div>
                      )}

                      {/* Script save */}
                      {isScript && (
                        <div className="mt-4">
                          <Button
                            variant={scriptSaved ? "ghost" : "secondary"}
                            size="sm"
                            onClick={handleToggleScript}
                            disabled={savingField === "scriptSaved"}
                          >
                            {scriptSaved ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Script saved
                              </>
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5" />
                                Save this script
                              </>
                            )}
                          </Button>
                          {saveSuccess === "scriptSaved" && (
                            <span className="ml-2 text-xs text-[#7C9A82]">Saved</span>
                          )}
                        </div>
                      )}

                      {/* Reflection textarea */}
                      {isReflection && (
                        <div className="mt-4 flex flex-col gap-3">
                          <Textarea
                            placeholder="Write your reflection here..."
                            value={reflectionText}
                            onChange={(e) => {
                              setReflectionText(e.target.value);
                              setReflectionDirty(true);
                            }}
                            rows={4}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSaveReflection}
                              disabled={!reflectionDirty || savingField === "reflectionText"}
                            >
                              {savingField === "reflectionText" ? "Saving..." : "Save reflection"}
                            </Button>
                            {saveSuccess === "reflectionText" && (
                              <span className="text-xs text-[#7C9A82]">Saved</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Check-in status */}
          <Card
            className={cn(
              journey.weekProgress?.checkInDone
                ? "border-[#7C9A82]/25 bg-[#7C9A82]/3"
                : "border-[#C4A49A]/25 bg-[#C4A49A]/5"
            )}
          >
            <div className="flex items-center gap-3">
              {journey.weekProgress?.checkInDone ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C9A82] text-white">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C4A49A]/20">
                  <Circle className="h-4 w-4 text-[#C4A49A]" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2D2D2D]/40">
                  Check-in
                </p>
                <p className="text-sm font-medium text-[#2D2D2D]">
                  {journey.weekProgress?.checkInDone
                    ? "Weekly check-in complete"
                    : "Weekly check-in"}
                </p>
              </div>
              {!journey.weekProgress?.checkInDone && (
                <Link href="/checkin">
                  <Button size="sm">Check in now</Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── Past Weeks (Placeholder Timeline) ── */}
      {currentWeek > 1 && (
        <div>
          <button
            type="button"
            onClick={() => setShowPastWeeks(!showPastWeeks)}
            className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D]/55 hover:text-[#2D2D2D]/70 transition-colors"
          >
            {showPastWeeks ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Past weeks ({currentWeek - 1})
          </button>

          {showPastWeeks && (
            <div className="mt-3 flex flex-col gap-2">
              {Array.from({ length: currentWeek - 1 }, (_, i) => i + 1)
                .reverse()
                .map((week) => (
                  <Card key={week} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C9A82]/15 text-sm font-semibold text-[#7C9A82]">
                        {week}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#2D2D2D]">
                          Week {week}
                        </p>
                      </div>
                      <Badge variant="sage">Completed</Badge>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
