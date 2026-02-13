import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Phase definitions
 * -------------------------------------------------------------------------- */

export type PhaseNumber = 1 | 2 | 3 | 4 | 5;

interface PhaseConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

const phaseMap: Record<PhaseNumber, PhaseConfig> = {
  1: {
    label: "Planning",
    bg: "bg-[#7C9A82]/15",
    text: "text-[#7C9A82]",
    dot: "bg-[#7C9A82]",
  },
  2: {
    label: "On Leave",
    bg: "bg-[#C4A49A]/20",
    text: "text-[#9A7B71]",
    dot: "bg-[#C4A49A]",
  },
  3: {
    label: "First 30 Days",
    bg: "bg-[#8BA4B8]/15",
    text: "text-[#6B8A9E]",
    dot: "bg-[#8BA4B8]",
  },
  4: {
    label: "Settling In",
    bg: "bg-[#D4A574]/15",
    text: "text-[#9A7548]",
    dot: "bg-[#D4A574]",
  },
  5: {
    label: "Thriving",
    bg: "bg-[#5A8F63]/15",
    text: "text-[#5A8F63]",
    dot: "bg-[#5A8F63]",
  },
};

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export interface PhaseBadgeProps {
  phase: PhaseNumber;
  className?: string;
}

export function PhaseBadge({ phase, className }: PhaseBadgeProps) {
  const config = phaseMap[phase];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span
        className={cn("inline-block h-1.5 w-1.5 rounded-full", config.dot)}
        aria-hidden="true"
      />
      Phase {phase}: {config.label}
    </span>
  );
}
