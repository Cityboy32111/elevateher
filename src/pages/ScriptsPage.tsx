import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText, Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const presetScenarios = [
  { id: "1", title: "Announcing your pregnancy to your manager", emoji: "📢" },
  { id: "2", title: "Setting boundaries about pumping schedule", emoji: "🛡️" },
  { id: "3", title: "Responding to insensitive comments", emoji: "💬" },
  { id: "4", title: "Negotiating a flexible work arrangement", emoji: "🤝" },
  { id: "5", title: "Having a promotion conversation post-leave", emoji: "📈" },
  { id: "6", title: "Addressing bias in performance reviews", emoji: "⚖️" },
];

const scriptTemplates: Record<string, string> = {
  "1": `## Announcing Your Pregnancy

### Opening

"Thank you for taking the time to meet with me. I have some exciting personal news to share — I'm expecting a baby! My due date is [date]."

### Key Points

1. **Share your timeline**: "I plan to begin my leave around [date] and return approximately [duration] later."

2. **Show your plan**: "I've been thinking about how to ensure a smooth transition. I'd like to start creating a handover plan with key deliverables and backup assignments."

3. **Express commitment**: "I want you to know that I'm fully committed to my role and this team. I want to make this transition as seamless as possible for everyone."

4. **Ask about policies**: "Could you point me toward our company's maternity leave policies so I can understand my options?"

### If They React Poorly

- Stay calm and professional
- "I understand this may require some planning, and I'm ready to work together on that"
- Document the conversation afterward
- Know your legal rights under FMLA and state laws`,

  "2": `## Setting Pumping Boundaries

### Opening

"I'd like to discuss my pumping schedule now that I'm back. I need to pump [X times] during the workday, and each session takes approximately [20-30] minutes."

### Key Points

1. **State your needs clearly**: "I'll need a private, lockable room with an electrical outlet and access to a sink nearby."

2. **Propose a schedule**: "I'd like to block [specific times] on my calendar for pumping. I'll be flexible when possible, but these times are important for my health."

3. **Reference your rights**: "Under the PUMP Act and [state law], employers are required to provide reasonable break time and a private space for nursing employees."

4. **Offer solutions**: "I can adjust my start or end time to make up any time if needed, and I'll make sure my team knows how to reach me in an emergency."

### Addressing Pushback

- **"Can you pump during lunch?"** → "Unfortunately, I need to pump more frequently than once a day to maintain my supply and avoid health complications."
- **"We don't have a room"** → "I'm happy to work with facilities to find a suitable space. It doesn't need to be fancy — just private and lockable."`,

  "3": `## Responding to Insensitive Comments

### Common Situations & Responses

**"Must be nice to have a vacation!" (about maternity leave)**
→ "Maternity leave is actually recovery from a major medical event while learning to keep a tiny human alive 24/7. It's many things, but 'vacation' isn't one of them."

**"So who's watching the baby?"**
→ "She's in great hands!" (smile, redirect to work topic)
→ Or: "That's a great question — do people ask you that too?"

**"Are you sure you can handle this project? You have a lot on your plate."**
→ "I appreciate the concern, but I wouldn't have taken this on if I wasn't confident. My capacity hasn't changed — just my morning routine."

**"When are you having the next one?"**
→ "That's a pretty personal question! Let's talk about [work topic] instead."

### General Framework

1. **Pause** — Don't react immediately
2. **Decide** — Is this worth addressing directly?
3. **Respond or redirect** — Use humor, set a boundary, or redirect to work
4. **Document** — If it's a pattern, keep a record`,

  "4": `## Negotiating Flexible Work

### Opening

"I'd like to discuss a flexible work arrangement that I believe will help me deliver my best work while managing my family responsibilities."

### Your Proposal

1. **Be specific**: "I'm proposing [hybrid: 3 days in-office/2 remote] [OR] [adjusted hours: 7am-3pm instead of 9-5]"

2. **Show the business case**: "Research shows that flexible work increases productivity by 13-25%. In my case, eliminating my commute [2 days/week] gives me an extra [X hours] of productive time."

3. **Offer a trial period**: "I'd love to try this for 90 days so we can measure the impact. I'll commit to [specific metrics/deliverables] during this time."

4. **Address concerns proactively**:
   - "I'll be fully available during core hours [10am-3pm]"
   - "I'll use video for all meetings so I'm present and visible"
   - "My response time on Slack/email will remain under [X minutes]"

### Closing

"I want to make this work for both of us. Can we discuss what would make you comfortable with this arrangement?"`,

  "5": `## Promotion Conversation Post-Leave

### Opening Statement

"Thank you for making time to meet with me. I wanted to discuss something important regarding my role and career trajectory as I transition back from leave."

### Key Talking Points

1. **Acknowledge your commitment**: "I want you to know that I'm fully committed to this team and my role. My time on leave has actually given me fresh perspective on how I can contribute even more effectively."

2. **Highlight recent contributions**: "Since returning, I've [specific accomplishments]. I believe these demonstrate my readiness for increased responsibility."

3. **State your ask clearly**: "I'd like to discuss the path to [promotion/raise/new role]. Based on [criteria], I believe I've met or exceeded the requirements."

4. **Address the elephant in the room**: "I know there can sometimes be unconscious assumptions about working parents' career ambitions. I want to be clear that my goals haven't changed — they've only become more focused."

5. **Propose a timeline**: "I'd like to work together on a 90-day plan that clearly outlines the milestones for this advancement."

### Handling Pushback

- **"The timing isn't right"** → "I understand timing matters. Could we set a specific date to revisit this? I'd also appreciate knowing exactly what milestones would make the timing right."
- **"You've been out for a while"** → "I appreciate that concern. Here's what I've done since returning [list]. I've also stayed current on [industry/team developments] during my leave."
- **"We need to see more consistency"** → "That's fair. Can we define what consistency looks like in measurable terms so I can track toward that?"

### Closing Statement

"I appreciate your time and openness. I'm excited about my future here and I want to make sure we're aligned on the path forward. Can we schedule a follow-up in [timeframe] to review progress?"`,

  "6": `## Addressing Bias in Performance Reviews

### Before the Review

1. **Prepare your evidence**: Document all accomplishments, metrics, and positive feedback received
2. **Know the criteria**: Review the performance framework and rate yourself honestly
3. **Anticipate bias**: Be ready for comments about "commitment" or "availability"

### During the Review

**If you receive a lower-than-expected rating:**
→ "I'd like to understand the specific criteria and examples that led to this rating. Can we walk through each area?"

**If leave time is factored in:**
→ "I want to make sure my rating reflects my actual work performance, not the time I was on protected leave. Can we look at my output during the periods I was working?"

**If 'commitment' is questioned:**
→ "I'd like to share some data points that demonstrate my commitment: [list deliverables, overtime, initiatives, positive feedback]."

**If compared unfavorably to pre-leave performance:**
→ "I'd prefer we evaluate my current performance against the role's standard criteria rather than comparing to a different period. My output this quarter includes [specifics]."

### After the Review

- Request a written copy of all feedback
- If you believe bias played a role, escalate to HR with specific examples
- Document everything in writing
- Follow up in writing: "Per our conversation, my understanding is..."`,
};

const defaultScript = scriptTemplates["5"];

export default function ScriptsPage() {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [customScenario, setCustomScenario] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (scenarioId: string | null, scenarioText: string) => {
    setLoading(true);
    setGeneratedScript("");

    // Use template if available, otherwise use default
    const template = scenarioId ? (scriptTemplates[scenarioId] || defaultScript) : defaultScript;

    // Simulate streaming effect
    const words = template.split(" ");
    let result = "";
    for (let i = 0; i < words.length; i++) {
      result += (i > 0 ? " " : "") + words[i];
      if (i % 8 === 0) {
        setGeneratedScript(result);
        await new Promise((r) => setTimeout(r, 15));
      }
    }
    setGeneratedScript(template);
    setLoading(false);

    // Save to ai_conversations
    if (user) {
      await supabase.from("ai_conversations").insert({
        user_id: user.id,
        scenario: scenarioText,
        messages: [
          { role: "user", content: scenarioText, timestamp: new Date().toISOString() },
          { role: "assistant", content: template, timestamp: new Date().toISOString() },
        ],
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    toast.success("Script copied to clipboard!");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Scripts</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered workplace communication scripts tailored for returning mothers
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Choose a Scenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presetScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all ${selectedScenario === scenario.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => {
                  setSelectedScenario(scenario.id);
                  handleGenerate(scenario.id, scenario.title);
                }}
              >
                <CardContent className="pt-6 flex items-start gap-3">
                  <span className="text-2xl">{scenario.emoji}</span>
                  <p className="font-medium text-sm">{scenario.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Or describe your own scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe the workplace situation you need a script for..."
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
              rows={3}
            />
            <Button
              onClick={() => handleGenerate(null, customScenario)}
              disabled={!customScenario.trim() || loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Script
            </Button>
          </CardContent>
        </Card>

        {(loading || generatedScript) && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Your Script
              </CardTitle>
              {generatedScript && !loading && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="mr-2 h-3 w-3" /> Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading && !generatedScript ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating your personalized script...
                </div>
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">{generatedScript}</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
