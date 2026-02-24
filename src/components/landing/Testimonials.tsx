import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Sarah Chen", title: "VP of People, TechCorp", quote: "elevateHer reduced our post-leave turnover by 67%. The ROI was visible within the first quarter.", initials: "SC" },
  { name: "Maria Rodriguez", title: "Returning Mom, FinanceHub", quote: "The scripts feature alone saved me from so many awkward conversations. I felt prepared and confident walking back in.", initials: "MR" },
  { name: "Jennifer Adams", title: "CHRO, HealthPlus", quote: "Finally, a platform that respects employee privacy while giving us the aggregate data we need to make decisions.", initials: "JA" },
];

export function Testimonials() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground">Trusted by leading companies and loved by returning mothers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-lavender-100">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-lavender-200 text-primary">{t.initials}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
