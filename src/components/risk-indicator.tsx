import { cn } from "@/lib/utils";
import { Phone, ExternalLink } from "lucide-react";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type RiskTier = "low" | "medium" | "high" | "critical";

export interface RiskIndicatorProps {
  tier: RiskTier;
  className?: string;
}

/* ---------------------------------------------------------------------------
 * Config per tier
 * -------------------------------------------------------------------------- */

interface TierConfig {
  dot: string;
  label: string;
  message: string | null;
  showCrisisResources: boolean;
}

const tierMap: Record<RiskTier, TierConfig> = {
  low: {
    dot: "bg-[#5A8F63]",
    label: "Low",
    message: null,
    showCrisisResources: false,
  },
  medium: {
    dot: "bg-[#D4A554]",
    label: "Medium",
    message: "Check in with your coach",
    showCrisisResources: false,
  },
  high: {
    dot: "bg-[#D48C54]",
    label: "High",
    message: "Let\u2019s get you support",
    showCrisisResources: false,
  },
  critical: {
    dot: "bg-[#C4605A]",
    label: "Critical",
    message: "We\u2019re here for you",
    showCrisisResources: true,
  },
};

/* ---------------------------------------------------------------------------
 * Crisis resources (shown only for critical tier)
 * -------------------------------------------------------------------------- */

const crisisResources = [
  {
    name: "Postpartum Support Intl.",
    phone: "1-800-944-4773",
    url: "https://www.postpartum.net",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    url: "https://988lifeline.org",
  },
];

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export function RiskIndicator({ tier, className }: RiskIndicatorProps) {
  const config = tierMap[tier];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Indicator row */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full shrink-0",
            config.dot
          )}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-[#2D2D2D]">
          {config.label}
        </span>
      </div>

      {/* Support message */}
      {config.message && (
        <p className="text-sm text-[#2D2D2D]/65 pl-[18px]">
          {config.message}
        </p>
      )}

      {/* Crisis resources (critical only) */}
      {config.showCrisisResources && (
        <div className="mt-1 rounded-lg border border-[#C4605A]/20 bg-[#C4605A]/5 p-3 pl-[18px]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#C4605A]/80">
            Crisis resources
          </p>
          <ul className="space-y-2">
            {crisisResources.map((resource) => (
              <li key={resource.name} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-[#2D2D2D]">
                  {resource.name}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-1 text-sm text-[#8BA4B8] hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {resource.phone}
                  </a>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#8BA4B8] hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Website
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
