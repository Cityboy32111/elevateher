import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Users, BarChart3, BookOpen, Shield, MessageSquare, Briefcase } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Coaching", description: "Personalized scripts, emotional support, and career guidance powered by AI" },
  { icon: Heart, title: "Emotional Health Tracking", description: "Daily mood check-ins with AI-driven exercises and support recommendations" },
  { icon: Users, title: "1:1 Expert Coaching", description: "Book sessions with certified return-to-work coaches for personalized guidance" },
  { icon: BarChart3, title: "Employer Analytics", description: "Aggregate insights on retention risk, engagement, and ROI — fully anonymized" },
  { icon: BookOpen, title: "Education Tracks", description: "Curated learning modules for partners and managers to build a supportive ecosystem" },
  { icon: Shield, title: "Privacy Firewall", description: "Employee data is strictly private. HR sees only aggregate, anonymized analytics" },
  { icon: MessageSquare, title: "Safe Community", description: "Anonymous-friendly discussion board for tips, wins, venting, and peer support" },
  { icon: Briefcase, title: "Career Toolkit", description: "Promotion calculator, visibility planner, workload mapper, and accomplishment vault" },
];

export function Features() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything She Needs to Thrive
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform covering every stage of the return-to-work journey
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-lavender-100 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-lavender-100 flex items-center justify-center mb-2">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
