"use client";

import * as React from "react";
import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface Organization {
  id: string;
  name: string;
  slug: string;
  totalSeats: number;
  usedSeats: number;
}

interface RiskDistribution {
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

interface PeriodData {
  period: string;
  totalEnrolled: number;
  activeUsers: number;
  checkInRate: number;
  coachingUtil: number;
  avgRiskScore: number;
  riskDistribution: RiskDistribution;
  topPainPoints: string[];
  retentionProxy: number;
}

interface AnalyticsData {
  organization: Organization;
  totalMembers: number;
  latestPeriod: PeriodData | null;
  historicalPeriods: PeriodData[];
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function AdminAnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [accessDenied, setAccessDenied] = React.useState(false);

  React.useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      setAccessDenied(false);

      try {
        const res = await fetch("/api/employer/analytics");

        if (res.status === 403) {
          setAccessDenied(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load analytics");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // Access denied state
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-7 w-7 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#2D2D2D]">Access Denied</h2>
          <p className="mt-2 text-sm text-[#2D2D2D]/60">
            You do not have permission to view employer analytics. This page is
            restricted to HR administrators and executives.
          </p>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C9A82] border-t-transparent" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md text-center">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { organization, latestPeriod, historicalPeriods } = data;
  const latest = latestPeriod;

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D2D2D]">
            {organization.name}
          </h1>
          <p className="mt-1 text-sm text-[#2D2D2D]/60">
            Employer analytics dashboard &middot;{" "}
            {organization.usedSeats}/{organization.totalSeats} seats used
          </p>
        </div>

        {!latest ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-[#2D2D2D]/50">
              No analytics data available yet. Data will appear after the first
              reporting period.
            </p>
          </Card>
        ) : (
          <>
            {/* Summary stat cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Enrolled"
                value={latest.totalEnrolled.toString()}
                color="sage"
              />
              <StatCard
                label="Active Users"
                value={latest.activeUsers.toString()}
                color="blue"
              />
              <StatCard
                label="Check-in Rate"
                value={`${Math.round(latest.checkInRate * 100)}%`}
                color="rose"
              />
              <StatCard
                label="Coaching Utilization"
                value={`${Math.round(latest.coachingUtil * 100)}%`}
                color="warm"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Risk Distribution */}
              <Card title="Risk Distribution">
                <div className="space-y-4">
                  <RiskBar
                    label="Low"
                    value={latest.riskDistribution.low}
                    total={latest.totalEnrolled}
                    color="bg-[#7C9A82]"
                  />
                  <RiskBar
                    label="Moderate"
                    value={latest.riskDistribution.moderate}
                    total={latest.totalEnrolled}
                    color="bg-[#D4A574]"
                  />
                  <RiskBar
                    label="High"
                    value={latest.riskDistribution.high}
                    total={latest.totalEnrolled}
                    color="bg-[#C4A49A]"
                  />
                  <RiskBar
                    label="Critical"
                    value={latest.riskDistribution.critical}
                    total={latest.totalEnrolled}
                    color="bg-[#C4706A]"
                  />
                </div>
                <div className="mt-4 text-right text-xs text-[#2D2D2D]/40">
                  Avg risk score: {latest.avgRiskScore.toFixed(1)}
                </div>
              </Card>

              {/* Top Pain Points */}
              <Card title="Top Pain Points">
                {latest.topPainPoints.length > 0 ? (
                  <div className="space-y-2">
                    {latest.topPainPoints.map((point, i) => (
                      <div
                        key={point}
                        className="flex items-center gap-3 rounded-lg border border-[#2D2D2D]/8 px-3 py-2.5"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C4A49A]/15 text-xs font-semibold text-[#9A7B71]">
                          {i + 1}
                        </span>
                        <span className="text-sm text-[#2D2D2D]/80">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-[#2D2D2D]/50">
                    No pain points data available.
                  </p>
                )}
              </Card>
            </div>

            {/* Engagement Trend */}
            {historicalPeriods.length > 1 && (
              <Card title="Engagement Trend" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#2D2D2D]/8">
                        <th className="pb-3 pr-4 font-medium text-[#2D2D2D]/60">
                          Period
                        </th>
                        <th className="pb-3 pr-4 font-medium text-[#2D2D2D]/60">
                          Enrolled
                        </th>
                        <th className="pb-3 pr-4 font-medium text-[#2D2D2D]/60">
                          Active
                        </th>
                        <th className="pb-3 pr-4 font-medium text-[#2D2D2D]/60">
                          Check-in
                        </th>
                        <th className="pb-3 pr-4 font-medium text-[#2D2D2D]/60">
                          Coaching
                        </th>
                        <th className="pb-3 font-medium text-[#2D2D2D]/60">
                          Retention
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalPeriods.map((period) => (
                        <tr
                          key={period.period}
                          className="border-b border-[#2D2D2D]/5 last:border-0"
                        >
                          <td className="py-3 pr-4 font-medium text-[#2D2D2D]">
                            {period.period}
                          </td>
                          <td className="py-3 pr-4 text-[#2D2D2D]/70">
                            {period.totalEnrolled}
                          </td>
                          <td className="py-3 pr-4 text-[#2D2D2D]/70">
                            {period.activeUsers}
                          </td>
                          <td className="py-3 pr-4 text-[#2D2D2D]/70">
                            {Math.round(period.checkInRate * 100)}%
                          </td>
                          <td className="py-3 pr-4 text-[#2D2D2D]/70">
                            {Math.round(period.coachingUtil * 100)}%
                          </td>
                          <td className="py-3 text-[#2D2D2D]/70">
                            {Math.round(period.retentionProxy * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Sub-components
 * -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "sage" | "blue" | "rose" | "warm";
}) {
  const colorMap = {
    sage: "bg-[#7C9A82]/10 text-[#7C9A82]",
    blue: "bg-[#8BA4B8]/10 text-[#6B8A9E]",
    rose: "bg-[#C4A49A]/10 text-[#9A7B71]",
    warm: "bg-[#D4A574]/10 text-[#9A7548]",
  };

  return (
    <Card>
      <p className="text-sm font-medium text-[#2D2D2D]/60">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#2D2D2D]">{value}</p>
      <div
        className={cn(
          "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
          colorMap[color]
        )}
      >
        {label}
      </div>
    </Card>
  );
}

function RiskBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-[#2D2D2D]/70">{label}</span>
        <span className="text-[#2D2D2D]/50">
          {value} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#2D2D2D]/5">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
