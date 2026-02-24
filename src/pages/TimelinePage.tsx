import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Baby, Bed, Rocket, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Task {
  text: string;
  completed: boolean;
}

interface Week {
  title: string;
  tasks: Task[];
}

interface Phase {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  weeks: Week[];
}

const initialPhases: Phase[] = [
  {
    id: "pregnancy",
    label: "Phase 1: Pregnancy Preparation",
    description: "Planning, workload mapping, promotion protection",
    icon: Baby,
    color: "bg-lavender-200/50",
    weeks: [
      { title: "Announce strategically", tasks: [{ text: "Draft announcement script", completed: false }, { text: "Map stakeholder reactions", completed: false }, { text: "Prepare workload handoff", completed: false }] },
      { title: "Protect your trajectory", tasks: [{ text: "Document accomplishments", completed: false }, { text: "Schedule promotion conversation", completed: false }, { text: "Set up visibility plan", completed: false }] },
      { title: "Prepare your handoff", tasks: [{ text: "Create SOPs for key tasks", completed: false }, { text: "Train backup person", completed: false }, { text: "Set expectations with manager", completed: false }] },
      { title: "Set boundaries early", tasks: [{ text: "Block calendar for appointments", completed: false }, { text: 'Practice "no" scripts', completed: false }, { text: "Plan last working day", completed: false }] },
    ],
  },
  {
    id: "leave",
    label: "Phase 2: Leave",
    description: "Recovery, emotional support, staying lightly connected",
    icon: Bed,
    color: "bg-green-100/50",
    weeks: [
      { title: "Protect your recovery", tasks: [{ text: "Set auto-responder", completed: false }, { text: "Designate one work contact", completed: false }, { text: "Establish sleep routine", completed: false }] },
      { title: "Stay lightly connected", tasks: [{ text: "15-min weekly team check-in", completed: false }, { text: "Follow industry news passively", completed: false }, { text: "Keep ideas log", completed: false }] },
      { title: "Manage identity shifts", tasks: [{ text: "Journal on identity changes", completed: false }, { text: "Connect with other moms", completed: false }, { text: "Practice self-compassion", completed: false }] },
      { title: "Plan your return", tasks: [{ text: "Set return date", completed: false }, { text: "Draft return week schedule", completed: false }, { text: "Prep childcare logistics", completed: false }] },
    ],
  },
  {
    id: "reentry",
    label: "Phase 3: Re-Entry Ramp",
    description: "First week scripts, boundary language, pumping logistics",
    icon: Rocket,
    color: "bg-amber-100/50",
    weeks: [
      { title: "First day preparation", tasks: [{ text: "Practice first-day script", completed: false }, { text: "Set up pumping room/schedule", completed: false }, { text: "Prepare boundary phrases", completed: false }] },
      { title: "Rebuild relationships", tasks: [{ text: "Schedule 1:1s with key stakeholders", completed: false }, { text: "Show genuine interest in what changed", completed: false }, { text: "Respond quickly", completed: false }] },
      { title: "Establish new rhythms", tasks: [{ text: "Block deep work time", completed: false }, { text: "Set hard stop times", completed: false }, { text: "Create morning routine", completed: false }] },
      { title: "Navigate awkward moments", tasks: [{ text: "Prepare responses for insensitive comments", completed: false }, { text: "Practice pumping at work logistics", completed: false }] },
    ],
  },
  {
    id: "year_back",
    label: "Phase 4: First Year Back",
    description: "Visibility, promotion readiness, long-term career strategy",
    icon: Trophy,
    color: "bg-primary/10",
    weeks: [
      { title: "Build visibility", tasks: [{ text: "Volunteer for high-visibility project", completed: false }, { text: "Share wins in team meetings", completed: false }, { text: "Update LinkedIn", completed: false }] },
      { title: "Secure your trajectory", tasks: [{ text: "Schedule performance review", completed: false }, { text: "Document ROI of your contributions", completed: false }, { text: "Ask for stretch assignment", completed: false }] },
      { title: "Strengthen boundaries", tasks: [{ text: "Review and adjust work hours", completed: false }, { text: "Audit time commitments", completed: false }, { text: "Practice saying no to extras", completed: false }] },
      { title: "Plan ahead", tasks: [{ text: "Set 1-year career goal", completed: false }, { text: "Identify next promotion criteria", completed: false }, { text: "Build sponsor relationships", completed: false }] },
    ],
  },
];

export default function TimelinePage() {
  const [phases, setPhases] = useState(initialPhases);

  const toggleTask = (phaseIdx: number, weekIdx: number, taskIdx: number) => {
    setPhases((prev) => {
      const next = structuredClone(prev);
      const task = next[phaseIdx].weeks[weekIdx].tasks[taskIdx];
      task.completed = !task.completed;
      if (task.completed) toast.success("Task completed!");
      return next;
    });
  };

  const getPhaseProgress = (phase: Phase) => {
    const total = phase.weeks.reduce((acc, w) => acc + w.tasks.length, 0);
    const done = phase.weeks.reduce((acc, w) => acc + w.tasks.filter((t) => t.completed).length, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Timeline</h1>
          <p className="text-muted-foreground mt-1">
            A guided 4-phase journey through your return-to-work experience
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {phases.map((phase, phaseIdx) => {
            const progress = getPhaseProgress(phase);
            return (
              <AccordionItem key={phase.id} value={phase.id} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className={`px-6 py-4 ${phase.color} hover:no-underline`}>
                  <div className="flex items-center gap-4 flex-1">
                    <phase.icon className="h-6 w-6 text-primary shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{phase.label}</p>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    </div>
                    <Badge variant="secondary" className="mr-4">{progress}%</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Progress value={progress} className="h-2 mb-4" />
                  <Accordion type="multiple" className="space-y-2">
                    {phase.weeks.map((week, weekIdx) => (
                      <AccordionItem key={weekIdx} value={`${phase.id}-w${weekIdx}`} className="border rounded">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                          {week.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3">
                          <div className="space-y-3">
                            {week.tasks.map((task, taskIdx) => (
                              <div key={taskIdx} className="flex items-center gap-3">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleTask(phaseIdx, weekIdx, taskIdx)}
                                />
                                <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                  {task.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </AppLayout>
  );
}
