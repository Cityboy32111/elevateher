import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, FileText, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";

interface Session {
  id: string;
  clientName: string;
  clientInitials: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string;
}

interface Client {
  id: string;
  name: string;
  initials: string;
  phase: string;
  sessionsCount: number;
  lastSession: string;
}

const upcomingSessions: Session[] = [
  { id: "1", clientName: "Sarah Mitchell", clientInitials: "SM", scheduledAt: "2026-02-25T10:00:00", duration: 30, status: "scheduled", notes: "" },
  { id: "2", clientName: "Jessica Wong", clientInitials: "JW", scheduledAt: "2026-02-25T14:00:00", duration: 30, status: "scheduled", notes: "" },
  { id: "3", clientName: "Amanda Roberts", clientInitials: "AR", scheduledAt: "2026-02-26T11:00:00", duration: 30, status: "scheduled", notes: "" },
];

const pastSessions: Session[] = [
  { id: "4", clientName: "Sarah Mitchell", clientInitials: "SM", scheduledAt: "2026-02-18T10:00:00", duration: 30, status: "completed", notes: "Discussed re-entry anxiety. Practiced boundary scripts. Homework: use the pumping schedule script at work." },
  { id: "5", clientName: "Maria Lopez", clientInitials: "ML", scheduledAt: "2026-02-17T15:00:00", duration: 30, status: "completed", notes: "Focused on promotion conversation prep. Used the career toolkit promotion calculator together." },
  { id: "6", clientName: "Jessica Wong", clientInitials: "JW", scheduledAt: "2026-02-15T14:00:00", duration: 30, status: "completed", notes: "Working through guilt about returning to work. Recommended emotional health exercises." },
];

const clients: Client[] = [
  { id: "1", name: "Sarah Mitchell", initials: "SM", phase: "Re-Entry", sessionsCount: 5, lastSession: "Feb 18, 2026" },
  { id: "2", name: "Jessica Wong", initials: "JW", phase: "Leave", sessionsCount: 3, lastSession: "Feb 15, 2026" },
  { id: "3", name: "Amanda Roberts", initials: "AR", phase: "Re-Entry", sessionsCount: 2, lastSession: "Feb 10, 2026" },
  { id: "4", name: "Maria Lopez", initials: "ML", phase: "Year Back", sessionsCount: 8, lastSession: "Feb 17, 2026" },
  { id: "5", name: "Kim Park", initials: "KP", phase: "Pregnancy", sessionsCount: 1, lastSession: "Feb 5, 2026" },
];

export default function ExpertDashboard() {
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});

  const handleSaveNotes = (sessionId: string) => {
    toast.success("Session notes saved!");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sessions and clients
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{upcomingSessions.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Active Clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{pastSessions.length}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">4.9</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
            <TabsTrigger value="clients">My Clients</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="pt-6 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-lavender-200 text-primary">
                      {session.clientInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{session.clientName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(session.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTime(session.scheduledAt)}
                      </span>
                      <span>{session.duration} min</span>
                    </div>
                  </div>
                  <Badge>Scheduled</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {pastSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-lavender-200 text-primary text-sm">
                        {session.clientInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{session.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.scheduledAt)} at {formatTime(session.scheduledAt)}
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  {session.notes && (
                    <div className="bg-muted/50 rounded-lg p-3 ml-14">
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                        {session.notes}
                      </p>
                    </div>
                  )}
                  <div className="ml-14">
                    <Textarea
                      placeholder="Add or update session notes..."
                      value={sessionNotes[session.id] || ""}
                      onChange={(e) => setSessionNotes((p) => ({ ...p, [session.id]: e.target.value }))}
                      rows={2}
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => handleSaveNotes(session.id)}
                      disabled={!sessionNotes[session.id]?.trim()}
                    >
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="clients" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-lavender-200 text-primary">
                        {client.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.sessionsCount} sessions | Last: {client.lastSession}
                      </p>
                    </div>
                    <Badge variant="secondary">{client.phase}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
