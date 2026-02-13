"use client";

import * as React from "react";
import {
  BookOpen,
  Sparkles,
  MessageSquareText,
  PenLine,
  Link2,
  Check,
  Circle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export interface WeekSlot {
  type: "lesson" | "action" | "script" | "reflection" | "resource";
  title: string;
  completed: boolean;
  href?: string;
}

export interface WeekCardProps {
  weekNumber: number;
  theme: string;
  slots: WeekSlot[];
  /** Overall completion (derived externally or auto-calculated) */
  className?: string;
}

/* ---------------------------------------------------------------------------
 * Slot icon mapping
 * -------------------------------------------------------------------------- */

const slotMeta: Record<
  WeekSlot["type"],
  { icon: React.ElementType; label: string }
> = {
  lesson: { icon: BookOpen, label: "Lesson" },
  action: { icon: Sparkles, label: "Action" },
  script: { icon: MessageSquareText, label: "Script" },
  reflection: { icon: PenLine, label: "Reflection" },
  resource: { icon: Link2, label: "Resource" },
};

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export function WeekCard({ weekNumber, theme, slots, className }: WeekCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const completedCount = slots.filter((s) => s.completed).length;
  const totalCount = slots.length;
  const allDone = completedCount === totalCount && totalCount > 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-shadow",
        allDone
          ? "border-[#7C9A82]/30"
          : "border-[#2D2D2D]/8",
        className
      )}
    >
      {/* Header -- always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        {/* Week number circle */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            allDone
              ? "bg-[#7C9A82] text-white"
              : "bg-[#2D2D2D]/8 text-[#2D2D2D]/60"
          )}
        >
          {allDone ? (
            <Check className="h-4 w-4" />
          ) : (
            weekNumber
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#2D2D2D]">
            Week {weekNumber}
          </p>
          <p className="truncate text-sm text-[#2D2D2D]/55">{theme}</p>
        </div>

        {/* Progress chip */}
        <span className="shrink-0 text-xs font-medium text-[#2D2D2D]/45">
          {completedCount}/{totalCount}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#2D2D2D]/35 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Progress bar */}
      <div className="px-5">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#2D2D2D]/6">
          <div
            className="h-full rounded-full bg-[#7C9A82] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Expandable slot list */}
      {expanded && (
        <div className="px-5 pb-4 pt-3">
          <ul className="space-y-1.5">
            {slots.map((slot, idx) => {
              const meta = slotMeta[slot.type];
              const Icon = meta.icon;

              const inner = (
                <li
                  key={idx}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    slot.href
                      ? "hover:bg-[#2D2D2D]/4 cursor-pointer"
                      : "",
                    slot.completed
                      ? "text-[#2D2D2D]/45"
                      : "text-[#2D2D2D]"
                  )}
                >
                  {/* Completed indicator */}
                  {slot.completed ? (
                    <Check className="h-4 w-4 shrink-0 text-[#7C9A82]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-[#2D2D2D]/25" />
                  )}

                  <Icon className="h-4 w-4 shrink-0 text-[#2D2D2D]/35" />

                  <span className="flex-1 min-w-0">
                    <span className="text-xs font-medium uppercase tracking-wide text-[#2D2D2D]/40 mr-1.5">
                      {meta.label}
                    </span>
                    <span
                      className={cn(
                        slot.completed && "line-through decoration-[#2D2D2D]/20"
                      )}
                    >
                      {slot.title}
                    </span>
                  </span>
                </li>
              );

              if (slot.href) {
                return (
                  <a key={idx} href={slot.href} className="block">
                    {inner}
                  </a>
                );
              }

              return <React.Fragment key={idx}>{inner}</React.Fragment>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
