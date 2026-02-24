import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Brain,
  Frown,
  Angry,
  CloudRain,
  Smile,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

const feelings = [
  { id: "anxious", label: "Anxious", icon: Brain, color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  { id: "overwhelmed", label: "Overwhelmed", icon: CloudRain, color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { id: "sad", label: "Sad", icon: Frown, color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { id: "angry", label: "Angry", icon: Angry, color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { id: "guilty", label: "Guilty", icon: Heart, color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  { id: "hopeful", label: "Hopeful", icon: Smile, color: "bg-green-100 text-green-700 hover:bg-green-200" },
];

const sampleResponses: Record<string, { acknowledgment: string; exercises: Array<{ title: string; steps: string[] }> }> = {
  anxious: {
    acknowledgment: "It's completely understandable to feel anxious right now. Returning to work is a major transition, and anxiety is your mind's way of trying to prepare you. You're not alone in this feeling, and it doesn't mean you're not ready.",
    exercises: [
      { title: "4-7-8 Breathing", steps: ["Breathe in through your nose for 4 seconds", "Hold your breath for 7 seconds", "Exhale slowly through your mouth for 8 seconds", "Repeat 3-4 times"] },
      { title: "Grounding Exercise", steps: ["Name 5 things you can see", "Name 4 things you can touch", "Name 3 things you can hear", "Name 2 things you can smell", "Name 1 thing you can taste"] },
      { title: "Worry Time-Boxing", steps: ["Set a 10-minute timer", "Write down every worry freely", "For each worry, write one small action you can take", "Close the notebook and return to the present"] },
    ],
  },
  overwhelmed: {
    acknowledgment: "Feeling overwhelmed is a natural response when juggling so many responsibilities. You're managing a huge amount right now — work, family, recovery — and it makes sense that it feels like too much sometimes. Give yourself grace.",
    exercises: [
      { title: "Brain Dump", steps: ["Get a blank paper", "Write everything on your mind — no order needed", "Circle the 3 most important items", "Cross out anything that can wait a week", "Focus only on the circled items today"] },
      { title: "2-Minute Reset", steps: ["Stand up and stretch for 30 seconds", "Take 5 deep breaths", "Splash cold water on your face", "Write down your ONE next step"] },
      { title: "Boundary Script", steps: ['Practice saying: "I can\'t take that on right now"', "Remember: saying no to one thing means saying yes to your wellbeing", "Identify one commitment you can delegate or postpone today"] },
    ],
  },
  sad: {
    acknowledgment: "Sadness during this transition is valid and common. You may be grieving the time with your baby, the identity you had before, or the way things used to be. These feelings deserve space, not dismissal.",
    exercises: [
      { title: "Gentle Movement", steps: ["Put on a song you love", "Walk slowly for 5 minutes", "Notice how your body feels", "No goals — just movement"] },
      { title: "Connection Reach-Out", steps: ["Text one friend or family member", "Share one honest sentence about how you're feeling", "You don't need to have a long conversation", "Just breaking the silence helps"] },
      { title: "Joy Inventory", steps: ["Write 3 small things that brought you joy recently", "They can be tiny (a warm cup of tea, a baby smile)", "Look at the list whenever sadness peaks", "Add to it daily"] },
    ],
  },
  angry: {
    acknowledgment: "Anger is a powerful signal that something feels unfair or that a boundary has been crossed. It's okay to be angry — about the system, about insensitive comments, about having to prove yourself again. Your anger is valid.",
    exercises: [
      { title: "Anger Release", steps: ["Find a private space", "Clench your fists tightly for 5 seconds", "Release and shake your hands out", "Repeat 5 times, noticing the tension leaving"] },
      { title: "Letter You Won't Send", steps: ["Write a letter to whoever/whatever made you angry", "Don't filter — be completely honest", "Read it once to yourself", "Then tear it up or delete it"] },
      { title: "Reframe and Act", steps: ["Ask: What boundary was crossed?", "Ask: What do I need right now?", "Identify one constructive action you can take", "Schedule it for today or tomorrow"] },
    ],
  },
  guilty: {
    acknowledgment: "Mom guilt is one of the most pervasive and least talked about feelings in the return-to-work journey. Whether it's guilt about leaving your baby, guilt about not being 'present enough' at work, or guilt about wanting your career — it's all normal. You're not failing anyone.",
    exercises: [
      { title: "Guilt Reframe", steps: ["Write down what you feel guilty about", "Now write: 'By working, I am...'", "List 3 positive things your career provides for your family", "Read your reframe out loud"] },
      { title: "Permission Slip", steps: ["Write yourself a permission slip", 'Example: "I give myself permission to enjoy my work"', "Put it where you'll see it daily", "Read it when guilt surfaces"] },
      { title: "Quality Over Quantity", steps: ["Plan one 15-minute fully present moment with your child today", "Put your phone away during this time", "Focus on connection, not perfection", "Remember: a happy, fulfilled parent is a gift to any child"] },
    ],
  },
  hopeful: {
    acknowledgment: "How wonderful that you're feeling hopeful! Hope is a powerful force, especially during transitions. Hold onto this feeling — it's a sign of your resilience and the strength you've been building throughout this journey.",
    exercises: [
      { title: "Vision Journaling", steps: ["Write about where you see yourself in 6 months", "Include both work and personal life", "Be specific about what 'good' looks like", "Read it weekly to stay motivated"] },
      { title: "Gratitude Capture", steps: ["Write down 3 things you're grateful for right now", "Include one thing about yourself", "Share one gratitude with someone you appreciate", "Make this a daily practice"] },
      { title: "Pay It Forward", steps: ["Think of another mom who might be struggling", "Send her an encouraging message", "Share one thing that's helped you", "Building connections amplifies hope"] },
    ],
  },
};

export default function EmotionalHealthPage() {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [intensity, setIntensity] = useState([5]);
  const [context, setContext] = useState("");
  const [response, setResponse] = useState<typeof sampleResponses["anxious"] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckin = async () => {
    if (!selectedFeeling) return;
    setLoading(true);
    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1500));
    setResponse(sampleResponses[selectedFeeling] || sampleResponses.anxious);
    setLoading(false);
  };

  const handleReset = () => {
    setSelectedFeeling(null);
    setIntensity([5]);
    setContext("");
    setResponse(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Crisis Disclaimer — permanent, non-dismissible */}
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 leading-relaxed">
            <strong>If you are in crisis or experiencing thoughts of self-harm,</strong> please stop and contact the{" "}
            <strong>988 Suicide and Crisis Lifeline</strong> by calling or texting <strong>988</strong>, or go to your nearest emergency room. This platform is not a crisis service.
          </p>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Emotional Health</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered emotional support — private and just for you
          </p>
        </div>

        {response ? (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleReset}>
              <ArrowLeft className="mr-2 h-4 w-4" /> New Check-in
            </Button>

            <Card className="border-lavender-200">
              <CardHeader>
                <CardTitle className="text-lg">We hear you</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{response.acknowledgment}</p>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recommended Exercises</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {response.exercises.map((exercise, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base">{exercise.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                        {exercise.steps.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Select Feeling */}
            <div>
              <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {feelings.map((feeling) => (
                  <button
                    key={feeling.id}
                    onClick={() => setSelectedFeeling(feeling.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      selectedFeeling === feeling.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : feeling.color
                    }`}
                  >
                    <feeling.icon className="h-6 w-6" />
                    <span className="font-medium">{feeling.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Intensity */}
            {selectedFeeling && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How intense is this feeling?</CardTitle>
                  <CardDescription>1 = mild, 10 = very intense</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Slider value={intensity} onValueChange={setIntensity} min={1} max={10} step={1} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Mild (1)</span>
                    <span className="font-semibold text-primary text-lg">{intensity[0]}</span>
                    <span>Intense (10)</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Context */}
            {selectedFeeling && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Want to share more? (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind? This is completely private..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleCheckin} disabled={loading}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Heart className="mr-2 h-4 w-4" /> Get Support</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
