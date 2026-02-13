"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      router.push("/onboarding");
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
          Create your account and start your journey.
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
            label="Name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            autoFocus
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />

          <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Card>

      <p className="text-sm text-[#2D2D2D]/55">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#7C9A82] hover:text-[#6B8971] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
