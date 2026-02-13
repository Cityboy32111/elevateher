"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Toggle } from "@/components/ui";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface User {
  id: string;
  name: string;
  email: string;
}

interface NotificationPrefs {
  weeklyNudge: boolean;
  dailyMicroPrompts: boolean;
  coachMessages: boolean;
  podActivity: boolean;
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [signingOut, setSigningOut] = React.useState(false);

  const [prefs, setPrefs] = React.useState<NotificationPrefs>({
    weeklyNudge: true,
    dailyMicroPrompts: true,
    coachMessages: true,
    podActivity: true,
  });

  React.useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C9A82] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D2D2D]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#2D2D2D]/60">
            Manage your account and notification preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <Card title="Account">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C4A49A]/20 text-lg font-semibold text-[#9A7B71]">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium text-[#2D2D2D]">{user.name}</p>
                    <p className="text-sm text-[#2D2D2D]/50">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#2D2D2D]/50">Unable to load user information.</p>
            )}
          </Card>

          {/* Notification Preferences */}
          <Card title="Notification Preferences">
            <div className="space-y-5">
              <Toggle
                checked={prefs.weeklyNudge}
                onChange={(val) => updatePref("weeklyNudge", val)}
                label="Weekly nudge"
              />
              <div className="border-t border-[#2D2D2D]/5" />

              <Toggle
                checked={prefs.dailyMicroPrompts}
                onChange={(val) => updatePref("dailyMicroPrompts", val)}
                label="Daily micro-prompts"
              />
              <div className="border-t border-[#2D2D2D]/5" />

              <Toggle
                checked={prefs.coachMessages}
                onChange={(val) => updatePref("coachMessages", val)}
                label="Coach messages"
              />
              <div className="border-t border-[#2D2D2D]/5" />

              <Toggle
                checked={prefs.podActivity}
                onChange={(val) => updatePref("podActivity", val)}
                label="Pod activity"
              />
            </div>
          </Card>

          {/* Sign out */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#2D2D2D]">Sign out</p>
                <p className="text-xs text-[#2D2D2D]/50">
                  End your current session and return to the login page.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </Card>
        </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
