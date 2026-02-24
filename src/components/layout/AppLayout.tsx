import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Map,
  Users,
  ScrollText,
  Heart,
  BookOpen,
  MessageSquare,
  Briefcase,
  Folder,
  Newspaper,
  Bell,
  LogOut,
  Menu,
  X,
  BarChart3,
  FileEdit,
  UserCog,
  UserPlus,
  CreditCard,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const employeeLinks = [
  { to: "/dashboard", label: "My Journey", icon: LayoutDashboard },
  { to: "/timeline", label: "Timeline", icon: Map },
  { to: "/coaching", label: "Coaching", icon: Users },
  { to: "/scripts", label: "Scripts", icon: ScrollText },
  { to: "/emotional-health", label: "Emotional Health", icon: Heart },
  { to: "/education", label: "Education", icon: BookOpen },
  { to: "/community", label: "Community", icon: MessageSquare },
  { to: "/career-toolkit", label: "Career Toolkit", icon: Briefcase },
  { to: "/resources", label: "Resources", icon: Folder },
  { to: "/content-feed", label: "Content Feed", icon: Newspaper },
];

const adminLinks = [
  { to: "/admin", label: "Employer Analytics", icon: BarChart3 },
  { to: "/content-manager", label: "Content Manager", icon: FileEdit },
  { to: "/admin/invite", label: "Invite Employees", icon: UserPlus },
  { to: "/admin/billing", label: "Billing", icon: CreditCard },
];

const coachLinks = [
  { to: "/expert", label: "Coach Dashboard", icon: UserCog },
  { to: "/therapist-onboarding", label: "Complete Profile", icon: ClipboardCheck },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const isActive = (path: string) => location.pathname === path;

  const navContent = (
    <>
      <div className="flex items-center gap-2 px-4 py-4">
        <Heart className="h-7 w-7 text-primary fill-primary" />
        <span className="text-xl font-bold text-primary">elevateHer</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {employeeLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.to)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}

          {profile?.role === "hr_admin" && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Admin
              </p>
              {adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.to)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {(profile?.role === "talia_coach" || profile?.role === "therapist") && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Coach
              </p>
              {coachLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.to)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="flex-1">{link.label}</span>
                  {link.to === "/therapist-onboarding" && (
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  )}
                </Link>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-3">
        <Link
          to="/notifications"
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive("/notifications")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications
          <Badge variant="secondary" className="ml-auto text-xs">
            0
          </Badge>
        </Link>
        <div className="flex items-center gap-3 px-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.role || "mom"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-sidebar">
        {navContent}
      </aside>

      {/* Mobile Header + Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r flex flex-col">
          <div className="flex items-center justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {navContent}
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="text-lg font-bold text-primary">elevateHer</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
