import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Eye, Map, Trophy, Plus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

// Promotion Calculator
function PromotionCalculator() {
  const [currentTitle, setCurrentTitle] = useState("");
  const [targetTitle, setTargetTitle] = useState("");
  const [currentSalary, setCurrentSalary] = useState(85000);
  const [targetSalary, setTargetSalary] = useState(105000);
  const [calculated, setCalculated] = useState(false);

  const salaryGrowth = targetSalary - currentSalary;
  const growthPercent = ((salaryGrowth / currentSalary) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Current Title</Label>
          <Input value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="e.g., Senior Analyst" />
        </div>
        <div className="space-y-2">
          <Label>Target Title</Label>
          <Input value={targetTitle} onChange={(e) => setTargetTitle(e.target.value)} placeholder="e.g., Lead Analyst" />
        </div>
        <div className="space-y-2">
          <Label>Current Salary ($)</Label>
          <Input type="number" value={currentSalary} onChange={(e) => setCurrentSalary(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Target Salary ($)</Label>
          <Input type="number" value={targetSalary} onChange={(e) => setTargetSalary(Number(e.target.value))} />
        </div>
      </div>
      <Button onClick={() => setCalculated(true)}>Calculate Path</Button>
      {calculated && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Salary Growth</p>
                <p className="text-2xl font-bold text-primary">${salaryGrowth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Growth Percentage</p>
                <p className="text-2xl font-bold text-primary">{growthPercent}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Timeline</p>
                <p className="text-2xl font-bold text-primary">6-12 months</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Recommended Actions:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Document 3-5 key accomplishments with measurable impact</li>
                <li>Request a development plan meeting with your manager</li>
                <li>Identify and close any skills gaps for the target role</li>
                <li>Build visibility through high-impact project contributions</li>
                <li>Secure at least one senior sponsor who advocates for you</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Visibility Planner
function VisibilityPlanner() {
  const [actions, setActions] = useState<Array<{ id: string; category: string; action: string; date: string }>>([
    { id: "1", category: "Meetings", action: "Present quarterly results to leadership", date: "2026-03-15" },
    { id: "2", category: "Projects", action: "Lead the cross-team integration project", date: "2026-04-01" },
  ]);
  const [newCategory, setNewCategory] = useState("Meetings");
  const [newAction, setNewAction] = useState("");
  const [newDate, setNewDate] = useState("");

  const addAction = () => {
    if (!newAction.trim()) return;
    setActions((prev) => [...prev, { id: Date.now().toString(), category: newCategory, action: newAction, date: newDate }]);
    setNewAction("");
    setNewDate("");
    toast.success("Action added!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Meetings", "Projects", "Presentations", "Networking", "Publishing"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Action</Label>
          <Input value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="What will you do?" />
        </div>
        <Button onClick={addAction}><Plus className="mr-2 h-4 w-4" /> Add</Button>
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <Card key={action.id}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{action.category}</Badge>
                <span className="text-sm">{action.action}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActions((prev) => prev.filter((a) => a.id !== action.id))}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {actions.length === 0 && <p className="text-muted-foreground text-center py-8">No visibility actions planned yet.</p>}
      </div>
    </div>
  );
}

// Workload Mapper
function WorkloadMapper() {
  const [tasks, setTasks] = useState<Array<{ id: string; name: string; impact: string; effort: string }>>([
    { id: "1", name: "Weekly status reports", impact: "low", effort: "high" },
    { id: "2", name: "Client presentation prep", impact: "high", effort: "high" },
    { id: "3", name: "Team mentoring", impact: "high", effort: "low" },
  ]);
  const [newTask, setNewTask] = useState("");
  const [newImpact, setNewImpact] = useState("high");
  const [newEffort, setNewEffort] = useState("high");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now().toString(), name: newTask, impact: newImpact, effort: newEffort }]);
    setNewTask("");
    toast.success("Task added!");
  };

  const quadrants = [
    { impact: "high", effort: "low", label: "Quick Wins", color: "bg-green-50 border-green-200", desc: "Do these first" },
    { impact: "high", effort: "high", label: "Major Projects", color: "bg-blue-50 border-blue-200", desc: "Schedule dedicated time" },
    { impact: "low", effort: "low", label: "Fill-ins", color: "bg-gray-50 border-gray-200", desc: "Do when you have gaps" },
    { impact: "low", effort: "high", label: "Delegate/Eliminate", color: "bg-red-50 border-red-200", desc: "Consider removing" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2 md:col-span-2">
          <Label>Task</Label>
          <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Task name" />
        </div>
        <div className="space-y-2">
          <Label>Impact</Label>
          <Select value={newImpact} onValueChange={setNewImpact}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addTask}><Plus className="mr-2 h-4 w-4" /> Add</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <Card key={q.label} className={`${q.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{q.label}</CardTitle>
              <CardDescription>{q.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.filter((t) => t.impact === q.impact && t.effort === q.effort).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 bg-white/70 rounded">
                    <span className="text-sm">{t.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => setTasks((prev) => prev.filter((x) => x.id !== t.id))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {tasks.filter((t) => t.impact === q.impact && t.effort === q.effort).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No tasks yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Accomplishment Vault
function AccomplishmentVault() {
  const [entries, setEntries] = useState<Array<{ id: string; date: string; title: string; description: string; impact: string; category: string }>>([
    { id: "1", date: "2026-02-10", title: "Led product launch", description: "Coordinated cross-functional team of 12 to deliver new feature ahead of schedule", impact: "Revenue impact: $150K ARR increase", category: "Leadership" },
    { id: "2", date: "2026-01-28", title: "Mentored junior developer", description: "3-month mentorship program resulting in successful solo project delivery", impact: "Team capability improvement, reduced code review time by 30%", category: "Mentoring" },
  ]);
  const [newEntry, setNewEntry] = useState({ date: "", title: "", description: "", impact: "", category: "Leadership" });

  const addEntry = () => {
    if (!newEntry.title.trim()) return;
    setEntries((prev) => [{ ...newEntry, id: Date.now().toString() }, ...prev]);
    setNewEntry({ date: "", title: "", description: "", impact: "", category: "Leadership" });
    toast.success("Accomplishment recorded!");
  };

  const handleCopyAll = () => {
    const text = entries.map((e) => `${e.date} - ${e.title}\n${e.description}\nImpact: ${e.impact}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Accomplishment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={newEntry.date} onChange={(e) => setNewEntry((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newEntry.title} onChange={(e) => setNewEntry((p) => ({ ...p, title: e.target.value }))} placeholder="What did you accomplish?" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newEntry.category} onValueChange={(v) => setNewEntry((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Leadership", "Technical", "Mentoring", "Business Impact", "Innovation", "Collaboration"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={newEntry.description} onChange={(e) => setNewEntry((p) => ({ ...p, description: e.target.value }))} placeholder="What did you do and how?" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Impact/Metrics</Label>
            <Input value={newEntry.impact} onChange={(e) => setNewEntry((p) => ({ ...p, impact: e.target.value }))} placeholder="Measurable impact..." />
          </div>
          <Button onClick={addEntry}><Plus className="mr-2 h-4 w-4" /> Add</Button>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Your Accomplishments ({entries.length})</h3>
        <Button variant="outline" size="sm" onClick={handleCopyAll}><Copy className="mr-2 h-3 w-3" /> Copy All</Button>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{entry.title}</p>
                    <Badge variant="secondary">{entry.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                  <p className="text-sm font-medium text-primary">{entry.impact}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CareerToolkitPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Career Toolkit</h1>
          <p className="text-muted-foreground mt-1">Tools to plan, track, and advance your career</p>
        </div>

        <Tabs defaultValue="promotion">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="promotion"><Calculator className="mr-1 h-3 w-3 hidden sm:inline" /> Promotion</TabsTrigger>
            <TabsTrigger value="visibility"><Eye className="mr-1 h-3 w-3 hidden sm:inline" /> Visibility</TabsTrigger>
            <TabsTrigger value="workload"><Map className="mr-1 h-3 w-3 hidden sm:inline" /> Workload</TabsTrigger>
            <TabsTrigger value="vault"><Trophy className="mr-1 h-3 w-3 hidden sm:inline" /> Vault</TabsTrigger>
          </TabsList>

          <TabsContent value="promotion" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Promotion Calculator</CardTitle>
                <CardDescription>Estimate your path to promotion and salary growth</CardDescription>
              </CardHeader>
              <CardContent><PromotionCalculator /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visibility" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Visibility Planner</CardTitle>
                <CardDescription>Plan actions to increase your workplace visibility</CardDescription>
              </CardHeader>
              <CardContent><VisibilityPlanner /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workload" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Workload Mapper</CardTitle>
                <CardDescription>Map your tasks by impact and effort (Eisenhower Matrix)</CardDescription>
              </CardHeader>
              <CardContent><WorkloadMapper /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vault" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Accomplishment Vault</CardTitle>
                <CardDescription>Record achievements for performance reviews and promotion conversations</CardDescription>
              </CardHeader>
              <CardContent><AccomplishmentVault /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
