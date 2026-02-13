"use client";

import * as React from "react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface Coach {
  id: string;
  bio: string | null;
  specialties: string | null;
  timezone: string | null;
}

interface CoachingSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status?: string;
  coach: Coach;
}

interface MessageUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: MessageUser;
  receiver: MessageUser;
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function CoachingPage() {
  const [sessions, setSessions] = React.useState<CoachingSession[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [coach, setCoach] = React.useState<Coach | null>(null);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Booking form
  const [bookingDate, setBookingDate] = React.useState("");
  const [bookingTime, setBookingTime] = React.useState("");
  const [bookingSubmitting, setBookingSubmitting] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  // Message form
  const [messageText, setMessageText] = React.useState("");
  const [sendingMessage, setSendingMessage] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Fetch data on mount
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch current user
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUserId(meData.user?.id ?? null);
        }

        // Fetch coaching sessions
        const sessionsRes = await fetch("/api/coaching/sessions");
        if (!sessionsRes.ok) throw new Error("Failed to load sessions");
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions ?? []);

        // Extract coach from sessions
        const firstSession = sessionsData.sessions?.[0];
        if (firstSession?.coach) {
          setCoach(firstSession.coach);

          // Fetch messages with coach
          const msgRes = await fetch(
            `/api/messages?partnerId=${firstSession.coach.id}`
          );
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            setMessages(msgData.messages ?? []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Scroll to bottom of messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Book a session
  async function handleBookSession(e: React.FormEvent) {
    e.preventDefault();
    if (!coach || !bookingDate || !bookingTime) return;

    setBookingSubmitting(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}`).toISOString();

      const res = await fetch("/api/coaching/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          scheduledAt,
          duration: 30,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to book session");
      }

      const data = await res.json();
      setSessions((prev) => [data.session, ...prev]);
      setBookingDate("");
      setBookingTime("");
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to book session");
    } finally {
      setBookingSubmitting(false);
    }
  }

  // Send a message
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!coach || !messageText.trim()) return;

    setSendingMessage(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: coach.id,
          content: messageText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setMessageText("");
    } catch {
      // silently fail
    } finally {
      setSendingMessage(false);
    }
  }

  // Upcoming sessions (future only)
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) > new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C9A82] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D2D2D]">
            Coaching
          </h1>
          <p className="mt-1 text-sm text-[#2D2D2D]/60">
            Connect with your coach for personalized support and guidance.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Your Coach */}
            <Card title="Your Coach">
              {coach ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C9A82]/15">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="h-6 w-6 text-[#7C9A82]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#2D2D2D]">Your Coach</p>
                      {coach.timezone && (
                        <p className="text-xs text-[#2D2D2D]/50">{coach.timezone}</p>
                      )}
                    </div>
                  </div>
                  {coach.bio && (
                    <p className="text-sm leading-relaxed text-[#2D2D2D]/70">{coach.bio}</p>
                  )}
                  {coach.specialties && (
                    <div className="flex flex-wrap gap-1.5">
                      {coach.specialties.split(",").map((s) => (
                        <span
                          key={s.trim()}
                          className="rounded-full bg-[#8BA4B8]/15 px-2.5 py-0.5 text-xs font-medium text-[#6B8A9E]"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C4A49A]/15">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-6 w-6 text-[#C4A49A]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[#2D2D2D]/70">
                    No coach assigned yet
                  </p>
                  <p className="mt-1 text-xs text-[#2D2D2D]/50">
                    You will be matched with a coach soon.
                  </p>
                </div>
              )}
            </Card>

            {/* Upcoming Sessions */}
            <Card title="Upcoming Sessions">
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 rounded-lg border border-[#2D2D2D]/8 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8BA4B8]/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className="h-5 w-5 text-[#8BA4B8]"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#2D2D2D]">
                          {formatDate(session.scheduledAt, "EEEE, MMM d")}
                        </p>
                        <p className="text-xs text-[#2D2D2D]/50">
                          {formatDate(session.scheduledAt, "h:mm a")} &middot;{" "}
                          {session.duration} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-[#2D2D2D]/50">
                  No upcoming sessions scheduled.
                </p>
              )}
            </Card>

            {/* Book a Session */}
            {coach && (
              <Card title="Book a Session">
                <form onSubmit={handleBookSession} className="space-y-4">
                  <Input
                    type="date"
                    label="Date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <Input
                    type="time"
                    label="Time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />

                  {bookingError && (
                    <p className="text-sm text-red-600">{bookingError}</p>
                  )}
                  {bookingSuccess && (
                    <p className="text-sm text-[#7C9A82]">
                      Session booked successfully!
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={bookingSubmitting || !bookingDate || !bookingTime}
                    className="w-full"
                  >
                    {bookingSubmitting ? "Booking..." : "Book Session"}
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Right column - Messages */}
          <div>
            <Card title="Messages" className="flex h-full flex-col">
              {coach ? (
                <>
                  {/* Message thread */}
                  <div className="flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: 460 }}>
                    {messages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#2D2D2D]/50">
                        No messages yet. Start a conversation with your coach.
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const isOwnMessage = msg.sender.id === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              isOwnMessage ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] rounded-xl px-3.5 py-2.5",
                                isOwnMessage
                                  ? "bg-[#7C9A82] text-white"
                                  : "bg-[#2D2D2D]/5 text-[#2D2D2D]"
                              )}
                            >
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <p
                                className={cn(
                                  "mt-1 text-xs",
                                  isOwnMessage
                                    ? "text-white/60"
                                    : "text-[#2D2D2D]/40"
                                )}
                              >
                                {formatDate(msg.createdAt, "MMM d, h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="mt-4 flex gap-2 border-t border-[#2D2D2D]/8 pt-4"
                  >
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="h-10 flex-1 rounded-lg border border-[#2D2D2D]/15 bg-white px-3 text-sm text-[#2D2D2D] placeholder:text-[#2D2D2D]/40 focus:border-[#8BA4B8] focus:outline-none focus:ring-2 focus:ring-[#8BA4B8]/25"
                    />
                    <Button
                      type="submit"
                      disabled={sendingMessage || !messageText.trim()}
                      size="md"
                    >
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <p className="py-12 text-center text-sm text-[#2D2D2D]/50">
                  Messages will be available once you are matched with a coach.
                </p>
              )}
            </Card>
          </div>
        </div>
    </div>
  );
}
