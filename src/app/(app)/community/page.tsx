"use client";

import * as React from "react";
import { Button, Card, Textarea } from "@/components/ui";
import { formatDate, cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface PostUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: PostUser;
}

interface PodPost {
  id: string;
  content: string;
  createdAt: string;
  user: PostUser;
  _count: { comments: number };
  comments?: PostComment[];
}

interface Pod {
  id: string;
  name: string;
  description: string | null;
  weeklyPrompt: string | null;
  posts: PodPost[];
  _count: { memberships: number };
  joinedAt: string;
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function CommunityPage() {
  const [pods, setPods] = React.useState<Pod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [postTexts, setPostTexts] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchPods() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/pods");
        if (!res.ok) throw new Error("Failed to load community pods");
        const data = await res.json();
        setPods(data.pods ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchPods();
  }, []);

  async function handleCreatePost(podId: string) {
    const content = postTexts[podId]?.trim();
    if (!content) return;

    setSubmitting(podId);

    try {
      const res = await fetch("/api/pods/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ podId, content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create post");
      }

      const data = await res.json();
      const newPost: PodPost = {
        ...data.post,
        _count: { comments: 0 },
      };

      setPods((prev) =>
        prev.map((pod) =>
          pod.id === podId
            ? { ...pod, posts: [newPost, ...pod.posts] }
            : pod
        )
      );
      setPostTexts((prev) => ({ ...prev, [podId]: "" }));
    } catch {
      // silently fail
    } finally {
      setSubmitting(null);
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
    <div className="flex flex-col gap-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D2D2D]">
            Community
          </h1>
          <p className="mt-1 text-sm text-[#2D2D2D]/60">
            Connect with your pod -- a small group of parents in a similar stage.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* No pods state */}
        {!error && pods.length === 0 && (
          <Card className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#C4A49A]/15">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-7 w-7 text-[#C4A49A]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#2D2D2D]">
              You&apos;ll be matched to a pod soon
            </h3>
            <p className="mt-2 text-sm text-[#2D2D2D]/60">
              We&apos;re finding the right group for you based on your stage and
              preferences. Check back soon!
            </p>
          </Card>
        )}

        {/* Pods */}
        <div className="space-y-8">
          {pods.map((pod) => (
            <div key={pod.id}>
              {/* Pod header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#2D2D2D]">
                    {pod.name}
                  </h2>
                  <p className="text-xs text-[#2D2D2D]/50">
                    {pod._count.memberships} member{pod._count.memberships !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Weekly prompt */}
              {pod.weeklyPrompt && (
                <div className="mb-5 rounded-xl border-l-4 border-[#C4A49A] bg-[#C4A49A]/8 px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#C4A49A]">
                    Weekly Prompt
                  </p>
                  <p className="text-sm leading-relaxed text-[#2D2D2D]/80">
                    {pod.weeklyPrompt}
                  </p>
                </div>
              )}

              {/* Write a post */}
              <Card className="mb-4">
                <Textarea
                  placeholder="Share something with your pod..."
                  value={postTexts[pod.id] ?? ""}
                  onChange={(e) =>
                    setPostTexts((prev) => ({
                      ...prev,
                      [pod.id]: e.target.value,
                    }))
                  }
                  className="min-h-[80px]"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleCreatePost(pod.id)}
                    disabled={
                      submitting === pod.id ||
                      !postTexts[pod.id]?.trim()
                    }
                  >
                    {submitting === pod.id ? "Posting..." : "Post"}
                  </Button>
                </div>
              </Card>

              {/* Posts */}
              {pod.posts.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#2D2D2D]/40">
                  No posts yet. Be the first to share!
                </p>
              ) : (
                <div className="space-y-3">
                  {pod.posts.map((post) => (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8BA4B8]/15 text-xs font-semibold text-[#6B8A9E]">
                          {getInitials(post.user.name)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#2D2D2D]">
                              {post.user.name}
                            </span>
                            <span className="text-xs text-[#2D2D2D]/40">
                              {timeAgo(post.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-[#2D2D2D]/80">
                            {post.content}
                          </p>

                          {/* Comment count */}
                          <div className="mt-2 flex items-center gap-1 text-xs text-[#2D2D2D]/40">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {post._count.comments}{" "}
                              {post._count.comments === 1 ? "comment" : "comments"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
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

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString, "MMM d");
}
