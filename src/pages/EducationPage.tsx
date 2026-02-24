import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Module {
  id: string;
  title: string;
  description: string;
  readingTime: string;
  content: string;
  completed: boolean;
}

const partnerModules: Module[] = [
  { id: "partner-mod-1", title: "Understanding the Mental Load", description: "Learn about the invisible labor that disproportionately falls on mothers", readingTime: "12 min", content: "The mental load refers to the invisible cognitive labor of managing a household and family. This includes remembering appointments, tracking supplies, planning meals, coordinating schedules, and dozens of other tasks that often go unnoticed. Research shows this load disproportionately falls on women, even in dual-income households.\n\nKey takeaways:\n- The mental load is real work that requires significant cognitive energy\n- Noticing what needs to be done is itself a form of labor\n- Sharing the mental load means taking ownership, not just 'helping'\n- Start by identifying all the invisible tasks in your household", completed: false },
  { id: "partner-mod-2", title: "Active Listening Techniques", description: "How to truly listen and validate your partner's experience", readingTime: "10 min", content: "Active listening means fully concentrating on what your partner is saying, rather than planning your response. When your partner shares her feelings about returning to work, she often needs to feel heard before she needs solutions.\n\nKey techniques:\n- Maintain eye contact and put away distractions\n- Reflect back what you heard: 'It sounds like you're feeling...'\n- Ask open-ended questions: 'Tell me more about that'\n- Avoid jumping to problem-solving unless asked", completed: false },
  { id: "partner-mod-3", title: "Division of Household Responsibilities", description: "Creating an equitable distribution of domestic tasks", readingTime: "15 min", content: "An equitable division of household labor is one of the strongest predictors of relationship satisfaction and successful return-to-work transitions. This module helps you audit and redistribute tasks fairly.", completed: false },
  { id: "partner-mod-4", title: "Supporting Career Ambitions", description: "Being an ally for your partner's professional growth", readingTime: "10 min", content: "Supporting your partner's career means more than just not standing in the way. It means actively championing her professional development, being flexible with childcare, and celebrating her achievements.", completed: false },
  { id: "partner-mod-5", title: "Navigating Childcare Decisions", description: "Making childcare decisions as a team", readingTime: "12 min", content: "Childcare decisions are among the most emotionally charged topics for new parents. This module guides you through frameworks for making these decisions collaboratively.", completed: false },
  { id: "partner-mod-6", title: "Financial Planning as New Parents", description: "Budgeting, benefits, and financial strategies", readingTime: "14 min", content: "Having a child changes your financial landscape. From childcare costs to insurance changes to tax benefits, this module covers the financial planning essentials for new parents.", completed: false },
  { id: "partner-mod-7", title: "Maintaining Relationship Connection", description: "Keeping your partnership strong through the transition", readingTime: "10 min", content: "The transition to working parenthood can strain even the strongest relationships. This module provides practical strategies for maintaining emotional connection.", completed: false },
  { id: "partner-mod-8", title: "Being an Ally at Home and Work", description: "Advocating for working mothers in every sphere", readingTime: "11 min", content: "Being an ally means using your position and privilege to advocate for policies and practices that support working parents. This starts at home and extends to your own workplace.", completed: false },
];

const managerModules: Module[] = [
  { id: "manager-mod-1", title: "Legal Obligations and Leave Policies", description: "Understanding FMLA, state laws, and company policies", readingTime: "15 min", content: "As a manager, you have legal obligations regarding maternity leave and return-to-work accommodations. This module covers FMLA basics, state-specific laws, and best practices for compliance.", completed: false },
  { id: "manager-mod-2", title: "Creating a Supportive Return Plan", description: "Building a structured re-onboarding experience", readingTime: "12 min", content: "A thoughtful return plan can make the difference between a successful transition and an employee deciding to leave. This module walks you through creating a structured re-onboarding experience.", completed: false },
  { id: "manager-mod-3", title: "Avoiding Unconscious Bias", description: "Recognizing and countering bias toward working mothers", readingTime: "14 min", content: "Unconscious bias against working mothers is well-documented and can significantly impact career trajectories. The 'motherhood penalty' affects hiring, performance reviews, promotion decisions, and daily interactions.", completed: false },
  { id: "manager-mod-4", title: "Flexible Work Best Practices", description: "Implementing effective flexible arrangements", readingTime: "10 min", content: "Flexible work arrangements are one of the top factors in retaining working mothers. This module covers how to implement flexibility effectively while maintaining team performance.", completed: false },
  { id: "manager-mod-5", title: "Performance Evaluation Fairness", description: "Ensuring unbiased performance reviews for returning employees", readingTime: "12 min", content: "Performance reviews for returning mothers require extra attention to ensure fairness. This module covers common pitfalls and strategies for equitable evaluation.", completed: false },
  { id: "manager-mod-6", title: "Career Development Post-Leave", description: "Supporting career growth for returning team members", readingTime: "11 min", content: "Career development shouldn't pause because of parental leave. This module covers how to keep returning team members on track for growth and advancement.", completed: false },
  { id: "manager-mod-7", title: "Building an Inclusive Team Culture", description: "Creating an environment where working parents thrive", readingTime: "13 min", content: "An inclusive team culture doesn't just benefit working mothers — it benefits everyone. This module covers practical steps for building a culture of belonging.", completed: false },
  { id: "manager-mod-8", title: "Retention Strategies for Working Parents", description: "Practical strategies to reduce turnover", readingTime: "14 min", content: "Losing an employee costs 1.5-2x their annual salary. This module covers proven retention strategies specifically for working parents.", completed: false },
];

export default function EducationPage() {
  const [partner, setPartner] = useState(partnerModules);
  const [manager, setManager] = useState(managerModules);

  const toggleModule = (track: "partner" | "manager", moduleId: string) => {
    const setter = track === "partner" ? setPartner : setManager;
    setter((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, completed: !m.completed } : m
      )
    );
    toast.success("Progress updated!");
  };

  const getProgress = (modules: Module[]) => {
    const completed = modules.filter((m) => m.completed).length;
    return Math.round((completed / modules.length) * 100);
  };

  const renderModules = (modules: Module[], track: "partner" | "manager") => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Progress value={getProgress(modules)} className="flex-1 h-2" />
        <span className="text-sm font-medium">{getProgress(modules)}%</span>
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {modules.map((mod) => (
          <AccordionItem key={mod.id} value={mod.id} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={mod.completed}
                  onCheckedChange={() => toggleModule(track, mod.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="text-left flex-1">
                  <p className={`font-medium ${mod.completed ? "line-through text-muted-foreground" : ""}`}>
                    {mod.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2 mr-4">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{mod.readingTime}</span>
                  {mod.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap pl-10">
                {mod.content}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Education</h1>
          <p className="text-muted-foreground mt-1">
            Learning tracks for partners and managers to build a supportive ecosystem
          </p>
        </div>

        <Tabs defaultValue="partner">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="partner">
              <BookOpen className="mr-2 h-4 w-4" /> Partner Track
            </TabsTrigger>
            <TabsTrigger value="manager">
              <BookOpen className="mr-2 h-4 w-4" /> Manager Track
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partner" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Partner Track</CardTitle>
                <CardDescription>
                  8 modules to help your partner/spouse support your return-to-work journey
                </CardDescription>
              </CardHeader>
              <CardContent>{renderModules(partner, "partner")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manager" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Manager Track</CardTitle>
                <CardDescription>
                  8 modules to help your direct manager create a supportive return experience
                </CardDescription>
              </CardHeader>
              <CardContent>{renderModules(manager, "manager")}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
