"use client";

import * as React from "react";
import { Button, Card, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Constants
 * -------------------------------------------------------------------------- */

const CATEGORIES = [
  "All",
  "Leave Planning",
  "Return to Work",
  "Manager Scripts",
  "Boundaries",
  "Pumping",
  "Childcare",
  "Sleep",
  "Career",
] as const;

const BADGE_VARIANT_MAP: Record<string, "sage" | "rose" | "blue" | "warm" | "neutral"> = {
  "Leave Planning": "sage",
  "Return to Work": "blue",
  "Manager Scripts": "warm",
  Boundaries: "rose",
  Pumping: "sage",
  Childcare: "blue",
  Sleep: "rose",
  Career: "warm",
};

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface Toolkit {
  id: string;
  title: string;
  description: string;
  category: string;
  body: string;
  tags: string;
  phase: number | null;
  isFavorited: boolean;
  createdAt: string;
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function ToolkitsPage() {
  const [toolkits, setToolkits] = React.useState<Toolkit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [togglingFav, setTogglingFav] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchToolkits = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await fetch(`/api/toolkits?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load toolkits");
      }
      const data = await res.json();
      setToolkits(data.toolkits ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  React.useEffect(() => {
    fetchToolkits();
  }, [fetchToolkits]);

  async function toggleFavorite(toolkitId: string) {
    setTogglingFav(toolkitId);
    try {
      const res = await fetch("/api/toolkits/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolkitId }),
      });

      if (!res.ok) {
        throw new Error("Failed to update favorite");
      }

      const data = await res.json();
      setToolkits((prev) =>
        prev.map((t) =>
          t.id === toolkitId ? { ...t, isFavorited: data.favorited } : t
        )
      );
    } catch {
      // silently fail for favorite toggle
    } finally {
      setTogglingFav(null);
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D2D2D]">
            Toolkits
          </h1>
          <p className="mt-1 text-sm text-[#2D2D2D]/60">
            Practical guides, scripts, and resources for every stage of your journey.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <Input
            placeholder="Search toolkits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Category pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === cat
                  ? "bg-[#7C9A82] text-white"
                  : "bg-[#2D2D2D]/5 text-[#2D2D2D]/60 hover:bg-[#2D2D2D]/10 hover:text-[#2D2D2D]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C9A82] border-t-transparent" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && toolkits.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[#2D2D2D]/50">
              No toolkits found. Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && toolkits.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolkits.map((toolkit) => {
              const isExpanded = expandedId === toolkit.id;

              return (
                <Card
                  key={toolkit.id}
                  className={cn(
                    "flex cursor-pointer flex-col transition-shadow hover:shadow-md",
                    isExpanded && "sm:col-span-2 lg:col-span-3"
                  )}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : toolkit.id)
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          variant={BADGE_VARIANT_MAP[toolkit.category] ?? "neutral"}
                        >
                          {toolkit.category}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-[#2D2D2D]">
                        {toolkit.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#2D2D2D]/60">
                        {toolkit.description}
                      </p>
                    </div>

                    {/* Favorite heart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(toolkit.id);
                      }}
                      disabled={togglingFav === toolkit.id}
                      className="shrink-0 p-1 transition-colors"
                      aria-label={
                        toolkit.isFavorited
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className={cn(
                          "h-5 w-5 transition-colors",
                          toolkit.isFavorited
                            ? "fill-[#C4A49A] text-[#C4A49A]"
                            : "fill-none text-[#2D2D2D]/30 hover:text-[#C4A49A]"
                        )}
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded body */}
                  {isExpanded && toolkit.body && (
                    <div className="mt-4 border-t border-[#2D2D2D]/8 pt-4">
                      <div
                        className="prose prose-sm max-w-none text-[#2D2D2D]/80 prose-headings:text-[#2D2D2D] prose-a:text-[#8BA4B8]"
                        dangerouslySetInnerHTML={{
                          __html: simpleMarkdown(toolkit.body),
                        }}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/** Very simple markdown-to-HTML converter for body content. */
function simpleMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
