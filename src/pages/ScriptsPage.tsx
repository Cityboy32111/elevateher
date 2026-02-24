import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const presetScenarios = [
  { id: "1", title: "Announcing your pregnancy to your manager", emoji: "📢" },
  { id: "2", title: "Setting boundaries about pumping schedule", emoji: "🛡️" },
  { id: "3", title: "Responding to insensitive comments", emoji: "💬" },
  { id: "4", title: "Negotiating a flexible work arrangement", emoji: "🤝" },
  { id: "5", title: "Having a promotion conversation post-leave", emoji: "📈" },
  { id: "6", title: "Addressing bias in performance reviews", emoji: "⚖️" },
];

const sampleScript = `## Opening Statement

"Thank you for making time to meet with me. I wanted to discuss something important regarding my role and career trajectory as I transition back from leave."

## Key Talking Points

1. **Acknowledge your commitment**: "I want you to know that I'm fully committed to this team and my role. My time on leave has actually given me fresh perspective on how I can contribute even more effectively."

2. **Highlight recent contributions**: "Since returning, I've [specific accomplishments]. I believe these demonstrate my readiness for increased responsibility."

3. **State your ask clearly**: "I'd like to discuss the path to [promotion/raise/new role]. Based on [criteria], I believe I've met or exceeded the requirements."

4. **Address the elephant in the room**: "I know there can sometimes be unconscious assumptions about working parents' career ambitions. I want to be clear that my goals haven't changed — they've only become more focused."

5. **Propose a timeline**: "I'd like to work together on a 90-day plan that clearly outlines the milestones for this advancement."

## Potential Pushback Responses

- **"The timing isn't right"** → "I understand timing matters. Could we set a specific date to revisit this? I'd also appreciate knowing exactly what milestones would make the timing right."

- **"You've been out for a while"** → "I appreciate that concern. Here's what I've done since returning [list]. I've also stayed current on [industry/team developments] during my leave."

- **"We need to see more consistency"** → "That's fair. Can we define what consistency looks like in measurable terms so I can track toward that?"

## Closing Statement

"I appreciate your time and openness. I'm excited about my future here and I want to make sure we're aligned on the path forward. Can we schedule a follow-up in [timeframe] to review progress?"`;

export default function ScriptsPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [customScenario, setCustomScenario] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (scenario: string) => {
    setLoading(true);
    setGeneratedScript("");
    // Simulate AI generation with streaming effect
    const words = sampleScript.split(" ");
    let result = "";
    for (let i = 0; i < words.length; i++) {
      result += (i > 0 ? " " : "") + words[i];
      if (i % 8 === 0) {
        setGeneratedScript(result);
        await new Promise((r) => setTimeout(r, 20));
      }
    }
    setGeneratedScript(sampleScript);
    setLoading(false);
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
                  handleGenerate(scenario.title);
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
              onClick={() => handleGenerate(customScenario)}
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
