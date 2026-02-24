import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { differenceInWeeks } from "date-fns";
import {
  Heart, Map, Users, ScrollText, BookOpen, MessageSquare,
  Briefcase, Folder, Smile, Meh, Frown, Sun, CloudRain,
} from "lucide-react";
import { toast } from "sonner";

function getCurrentPhase(returnDate: string | null): string {
  if (!returnDate) return "pregnancy";
  const now = new Date();
  const rd = new Date(returnDate);
  const weeksUntilReturn = differenceInWeeks(rd, now);
  if (weeksUntilReturn > 0) return "leave";
  const weeksSinceReturn = differenceInWeeks(now, rd);
  if (weeksSinceReturn <= 12) return "reentry";
  return "year_back";
}

const phaseLabels: Record<string, string> = {
  pregnancy: "Phase 1: Pregnancy Preparation",
  leave: "Phase 2: Leave",
  reentry: "Phase 3: Re-Entry Ramp",
  year_back: "Phase 4: First Year Back",
};

const phaseColors: Record<string, string> = {
  pregnancy: "bg-lavender-200 text-lavender-800",
  leave: "bg-green-100 text-green-800",
  reentry: "bg-amber-100 text-amber-800",
  year_back: "bg-primary/10 text-primary",
};

const moodEmojis = [
  { score: 1, icon: Frown, label: "Struggling", color: "text-red-500" },
  { score: 2, icon: CloudRain, label: "Tough", color: "text-orange-500" },
  { score: 3, icon: Meh, label: "Okay", color: "text-yellow-500" },
  { score: 4, icon: Smile, label: "Good", color: "text-green-500" },
  { score: 5, icon: Sun, label: "Great", color: "text-primary" },
];

const quickLinks = [
  { to: "/timeline", label: "Timeline", icon: Map, color: "bg-lavender-100" },
  { to: "/coaching", label: "Coaching", icon: Users, color: "bg-blue-50" },
  { to: "/scripts", label: "Scripts", icon: ScrollText, color: "bg-amber-50" },
  { to: "/emotional-health", label: "Emotional Health", icon: Heart, color: "bg-pink-50" },
  { to: "/education", label: "Education", icon: BookOpen, color: "bg-green-50" },
  { to: "/community", label: "Community", icon: MessageSquare, color: "bg-indigo-50" },
  { to: "/career-toolkit", label: "Career Toolkit", icon: Briefcase, color: "bg-purple-50" },
  { to: "/resources", label: "Resources", icon: Folder, color: "bg-teal-50" },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const phase = getCurrentPhase(profile?.return_date || null);
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const handleMoodSelect = (score: number) => {
    setSelectedMood(score);
    toast.success("Mood recorded! Take care of yourself today.");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-lavender-100 border-lavender-200">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl">Welcome back, {firstName}!</CardTitle>
                <CardDescription className="text-base mt-1">
                  Here's your journey overview for today
                </CardDescription>
              </div>
              <Badge className={phaseColors[phase]}>{phaseLabels[phase]}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Daily Mood Check-in */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling today?</CardTitle>
            <CardDescription>Your daily check-in is private — only you can see this</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 md:gap-8">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.score}
                  onClick={() => handleMoodSelect(mood.score)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                    selectedMood === mood.score
                      ? "bg-primary/10 ring-2 ring-primary scale-110"
                      : "hover:bg-muted"
                  }`}
                >
                  <mood.icon className={`h-8 w-8 ${mood.color}`} />
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                    <div className={`h-12 w-12 rounded-lg ${link.color} flex items-center justify-center`}>
                      <link.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium text-sm">{link.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Coaching + Weekly Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Coaching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No upcoming sessions.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/coaching">Book a Session</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Focus on your current phase tasks to stay on track.
              </p>
              <Progress value={35} className="h-2" />
              <p className="text-xs text-muted-foreground">35% of this week's tasks completed</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/timeline">View Timeline</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
