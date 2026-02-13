"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Wordmark */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#2D2D2D]">
          elevate<span className="text-[#7C9A82]">her</span>
        </h1>
        <p className="mt-2 text-sm text-[#2D2D2D]/55">
          Welcome back. Sign in to continue your journey.
        </p>
      </div>

      <Card className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-lg bg-[#C4605A]/8 px-4 py-3 text-sm text-[#C4605A]">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            minLength={8}
          />

          <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>

      <p className="text-sm text-[#2D2D2D]/55">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#7C9A82] hover:text-[#6B8971] transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
