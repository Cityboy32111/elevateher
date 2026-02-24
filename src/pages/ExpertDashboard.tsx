import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  Star,
  AlertTriangle,
  Lock,
  DollarSign,
  Shield,
  Pencil,
  Eye,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Session {
  id: string;
  clientName: string;
  clientId: string;
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

interface TherapyNote {
  id: string;
  sessionId: string;
  noteType: string;
  content: string;
  isLocked: boolean;
  createdAt: string;
}

interface License {
  id: string;
  licenseType: string;
  state: string;
  licenseNumber: string;
  expiresOn: string;
  verified: boolean;
}

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Payout {
  period: string;
  sessions: number;
  amount: number;
  status: string;
  paidAt: string | null;
}

const upcomingSessions: Session[] = [
  { id: "1", clientName: "Sarah Mitchell", clientId: "c1", clientInitials: "SM", scheduledAt: "2026-02-25T10:00:00", duration: 30, status: "scheduled", notes: "" },
  { id: "2", clientName: "Jessica Wong", clientId: "c2", clientInitials: "JW", scheduledAt: "2026-02-25T14:00:00", duration: 30, status: "scheduled", notes: "" },
  { id: "3", clientName: "Amanda Roberts", clientId: "c3", clientInitials: "AR", scheduledAt: "2026-02-26T11:00:00", duration: 30, status: "scheduled", notes: "" },
];

const pastSessions: Session[] = [
  { id: "4", clientName: "Sarah Mitchell", clientId: "c1", clientInitials: "SM", scheduledAt: "2026-02-18T10:00:00", duration: 30, status: "completed", notes: "" },
  { id: "5", clientName: "Maria Lopez", clientId: "c4", clientInitials: "ML", scheduledAt: "2026-02-17T15:00:00", duration: 30, status: "completed", notes: "" },
  { id: "6", clientName: "Jessica Wong", clientId: "c2", clientInitials: "JW", scheduledAt: "2026-02-15T14:00:00", duration: 30, status: "completed", notes: "" },
];

const clients: Client[] = [
  { id: "1", name: "Sarah Mitchell", initials: "SM", phase: "Re-Entry", sessionsCount: 5, lastSession: "Feb 18, 2026" },
  { id: "2", name: "Jessica Wong", initials: "JW", phase: "Leave", sessionsCount: 3, lastSession: "Feb 15, 2026" },
  { id: "3", name: "Amanda Roberts", initials: "AR", phase: "Re-Entry", sessionsCount: 2, lastSession: "Feb 10, 2026" },
  { id: "4", name: "Maria Lopez", initials: "ML", phase: "Year Back", sessionsCount: 8, lastSession: "Feb 17, 2026" },
  { id: "5", name: "Kim Park", initials: "KP", phase: "Pregnancy", sessionsCount: 1, lastSession: "Feb 5, 2026" },
];

const sampleNotes: Record<string, TherapyNote> = {
  "4": { id: "n1", sessionId: "4", noteType: "session", content: "Discussed re-entry anxiety. Practiced boundary scripts. Homework: use the pumping schedule script at work.", isLocked: true, createdAt: "2026-02-18T10:35:00" },
  "5": { id: "n2", sessionId: "5", noteType: "session", content: "Focused on promotion conversation prep. Used the career toolkit promotion calculator together.", isLocked: true, createdAt: "2026-02-17T15:32:00" },
};

const sampleLicenses: License[] = [
  { id: "l1", licenseType: "LCSW", state: "CA", licenseNumber: "LCSW-78421", expiresOn: "2027-06-30", verified: true },
  { id: "l2", licenseType: "LCSW", state: "NY", licenseNumber: "LCSW-92103", expiresOn: "2026-12-31", verified: true },
  { id: "l3", licenseType: "LCSW", state: "TX", licenseNumber: "LCSW-15890", expiresOn: "2025-03-15", verified: false },
];

const sampleAvailability: AvailabilitySlot[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "13:00", isActive: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 5, startTime: "10:00", endTime: "15:00", isActive: true },
  { dayOfWeek: 6, startTime: "00:00", endTime: "00:00", isActive: false },
  { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isActive: false },
];

const samplePayouts: Payout[] = [
  { period: "January 2026", sessions: 18, amount: 3600, status: "paid", paidAt: "2026-02-15" },
  { period: "December 2025", sessions: 15, amount: 3000, status: "paid", paidAt: "2026-01-15" },
  { period: "November 2025", sessions: 20, amount: 4000, status: "paid", paidAt: "2025-12-15" },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 21; h++) {
  for (const m of [0, 30]) {
    if (h === 21 && m === 30) continue;
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    TIME_OPTIONS.push(`${hh}:${mm}`);
  }
}

function formatTimeLabel(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${suffix}`;
}

function getLicenseStatus(license: License): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (new Date(license.expiresOn) < new Date()) return { label: "Expired", variant: "destructive" };
  if (license.verified) return { label: "Verified", variant: "default" };
  return { label: "Pending", variant: "secondary" };
}

// Sample: assume onboarding is complete (has licenses)
const hasCompletedOnboarding = true;

export default function ExpertDashboard() {
  const [notes, setNotes] = useState<Record<string, TherapyNote>>(sampleNotes);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingNote, setEditingNote] = useState<TherapyNote | null>(null);
  const [noteType, setNoteType] = useState("session");
  const [noteContent, setNoteContent] = useState("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(sampleAvailability);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const openAddNote = (session: Session) => {
    setEditingSession(session);
    setEditingNote(null);
    setNoteType("session");
    setNoteContent("");
    setNoteDialogOpen(true);
  };

  const openViewNote = (session: Session, note: TherapyNote) => {
    setEditingSession(session);
    setEditingNote(note);
    setNoteType(note.noteType);
    setNoteContent(note.content);
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!editingSession) return;
    const now = new Date().toISOString();
    if (editingNote) {
      setNotes((prev) => ({
        ...prev,
        [editingSession.id]: { ...editingNote, content: noteContent, noteType },
      }));
      toast.success("Note updated");
    } else {
      const newNote: TherapyNote = {
        id: `n-${Date.now()}`,
        sessionId: editingSession.id,
        noteType,
        content: noteContent,
        isLocked: false,
        createdAt: now,
      };
      setNotes((prev) => ({ ...prev, [editingSession.id]: newNote }));
      toast.success("Note saved");
    }
    setNoteDialogOpen(false);
  };

  const isNoteLocked = (note: TherapyNote): boolean => {
    if (note.isLocked) return true;
    const created = new Date(note.createdAt);
    const now = new Date();
    return now.getTime() - created.getTime() > 24 * 60 * 60 * 1000;
  };

  const updateAvailability = (dayOfWeek: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSaveAvailability = () => {
    toast.success("Availability updated");
  };

  // Current month stats
  const currentMonthSessions = pastSessions.filter((s) => s.status === "completed").length;
  const expectedPayout = currentMonthSessions * 200;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Onboarding Banner */}
        {!hasCompletedOnboarding && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800 font-medium">
                Complete your profile to start seeing clients
              </p>
            </div>
            <Link to="/therapist-onboarding">
              <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-800 hover:bg-yellow-100">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}

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
              <p className="text-2xl font-bold">{currentMonthSessions}</p>
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
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Upcoming Sessions */}
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

          {/* Past Sessions with Notes */}
          <TabsContent value="past" className="mt-4 space-y-4">
            {pastSessions.map((session) => {
              const note = notes[session.id];
              const locked = note ? isNoteLocked(note) : false;

              return (
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

                    {note ? (
                      <div className="ml-14 space-y-2">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{note.noteType}</Badge>
                            {locked && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Lock className="h-3 w-3" /> Locked
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                        </div>
                        {!locked ? (
                          <Button size="sm" variant="outline" onClick={() => openViewNote(session, note)}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit Note
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => openViewNote(session, note)}>
                            <Eye className="mr-1 h-3 w-3" /> View Note
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="ml-14">
                        <Button size="sm" variant="outline" onClick={() => openAddNote(session)}>
                          <Plus className="mr-1 h-3 w-3" /> Add Note
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Clients */}
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

          {/* Availability */}
          <TabsContent value="availability" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Set your available hours for client bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                  const slot = availability.find((s) => s.dayOfWeek === day)!;
                  return (
                    <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
                      <div className="w-28">
                        <Label className="font-medium">{DAY_NAMES[day]}</Label>
                      </div>
                      <Switch
                        checked={slot.isActive}
                        onCheckedChange={(checked) => updateAvailability(day, "isActive", checked)}
                      />
                      {slot.isActive && (
                        <div className="flex items-center gap-2 flex-1">
                          <Select
                            value={slot.startTime}
                            onValueChange={(v) => updateAvailability(day, "startTime", v)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t} value={t}>{formatTimeLabel(t)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">to</span>
                          <Select
                            value={slot.endTime}
                            onValueChange={(v) => updateAvailability(day, "endTime", v)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((t) => (
                                <SelectItem key={t} value={t}>{formatTimeLabel(t)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {!slot.isActive && (
                        <span className="text-sm text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  );
                })}
                <Button onClick={handleSaveAvailability} className="mt-4">
                  Save Availability
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses */}
          <TabsContent value="licenses" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> License Status
                </CardTitle>
                <CardDescription>Your professional licenses and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleLicenses.map((license) => {
                    const status = getLicenseStatus(license);
                    return (
                      <div key={license.id} className="flex items-center gap-4 p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">{license.licenseType}</p>
                          <p className="text-sm text-muted-foreground">
                            {license.state} — #{license.licenseNumber}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expires: {format(new Date(license.expiresOn), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    );
                  })}
                </div>
                <Link to="/therapist-onboarding" className="block mt-4">
                  <Button variant="outline" size="sm">Manage Licenses</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings */}
          <TabsContent value="earnings" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{currentMonthSessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions This Month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">${expectedPayout.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Expected Payout</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Payments are processed on the 15th of each month for the prior month's completed sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Period</th>
                        <th className="text-left py-2 font-medium">Sessions</th>
                        <th className="text-left py-2 font-medium">Amount</th>
                        <th className="text-left py-2 font-medium">Status</th>
                        <th className="text-left py-2 font-medium">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samplePayouts.map((payout, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-3">{payout.period}</td>
                          <td className="py-3">{payout.sessions}</td>
                          <td className="py-3">${payout.amount.toLocaleString()}</td>
                          <td className="py-3">
                            <Badge variant={payout.status === "paid" ? "default" : "secondary"}>
                              {payout.status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {payout.paidAt ? format(new Date(payout.paidAt), "MMM d, yyyy") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Payments are processed on the 15th of each month for the prior month's completed sessions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Note Dialog */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? (isNoteLocked(editingNote) ? "View Note" : "Edit Note") : "Add Note"}
              </DialogTitle>
            </DialogHeader>
            {editingSession && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Client:</strong> {editingSession.clientName}</p>
                  <p><strong>Session:</strong> {formatDate(editingSession.scheduledAt)} at {formatTime(editingSession.scheduledAt)}</p>
                </div>

                <div className="space-y-2">
                  <Label>Note Type</Label>
                  <Select
                    value={noteType}
                    onValueChange={setNoteType}
                    disabled={editingNote ? isNoteLocked(editingNote) : false}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="session">Session Note</SelectItem>
                      <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                      <SelectItem value="treatment_plan">Treatment Plan Update</SelectItem>
                      <SelectItem value="follow_up">Follow-up Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Note Content</Label>
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter your clinical notes..."
                    className="min-h-[200px]"
                    disabled={editingNote ? isNoteLocked(editingNote) : false}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Notes are private and visible only to you. They are locked for editing 24 hours after creation.
                </p>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                    {editingNote && isNoteLocked(editingNote) ? "Close" : "Cancel"}
                  </Button>
                  {!(editingNote && isNoteLocked(editingNote)) && (
                    <Button onClick={handleSaveNote} disabled={!noteContent.trim()}>
                      Save Note
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
