"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Map,
  Heart,
  BookOpen,
  MessageCircle,
  Users,
  LogOut,
  ChevronUp,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface NavUser {
  name: string;
  email: string;
}

export interface NavProps {
  user: NavUser;
}

/* ---------------------------------------------------------------------------
 * Navigation items
 * -------------------------------------------------------------------------- */

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/journey", label: "Journey", icon: Map },
  { href: "/checkin", label: "Check-in", icon: Heart },
  { href: "/toolkits", label: "Toolkits", icon: BookOpen },
  { href: "/coaching", label: "Coaching", icon: MessageCircle },
  { href: "/community", label: "Community", icon: Users },
] as const;

/* ---------------------------------------------------------------------------
 * Initials helper
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

/* ---------------------------------------------------------------------------
 * Sidebar (desktop)
 * -------------------------------------------------------------------------- */

function Sidebar({ user }: NavProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex flex-1 flex-col border-r border-[#2D2D2D]/8 bg-white">
        {/* Brand */}
        <div className="flex h-14 items-center px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-[#2D2D2D]">
              elevate<span className="text-[#7C9A82]">her</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 px-3 pt-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#7C9A82]/10 text-[#7C9A82]"
                    : "text-[#2D2D2D]/60 hover:bg-[#2D2D2D]/5 hover:text-[#2D2D2D]"
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="relative border-t border-[#2D2D2D]/8 p-3">
          {/* Flyout */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border border-[#2D2D2D]/8 bg-white p-1 shadow-md">
              <button
                onClick={() => {
                  /* sign-out logic would go here */
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#2D2D2D]/70 hover:bg-[#2D2D2D]/5 hover:text-[#2D2D2D] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}

          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#2D2D2D]/5 transition-colors"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C4A49A]/25 text-xs font-semibold text-[#9A7B71]">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-[#2D2D2D]">
                {user.name}
              </p>
              <p className="truncate text-xs text-[#2D2D2D]/50">
                {user.email}
              </p>
            </div>
            <ChevronUp
              className={cn(
                "h-4 w-4 shrink-0 text-[#2D2D2D]/40 transition-transform",
                userMenuOpen ? "rotate-0" : "rotate-180"
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------------------
 * Bottom bar (mobile)
 * -------------------------------------------------------------------------- */

function BottomBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#2D2D2D]/8 bg-white md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[#7C9A82]"
                  : "text-[#2D2D2D]/45 hover:text-[#2D2D2D]/70"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area inset for notched phones */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

/* ---------------------------------------------------------------------------
 * Combined Nav export
 * -------------------------------------------------------------------------- */

export function Nav({ user }: NavProps) {
  return (
    <>
      <Sidebar user={user} />
      <BottomBar />
    </>
  );
}
