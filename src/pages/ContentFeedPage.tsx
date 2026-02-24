import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Image, FileAudio, File } from "lucide-react";

const mediaTypeIcons: Record<string, React.ElementType> = {
  article: FileText,
  video: Video,
  image: Image,
  audio: FileAudio,
  pdf: File,
};

const sampleContent = [
  {
    id: "1",
    title: "Navigating Your First Week Back: A Manager's Perspective",
    body: "Your first week back doesn't have to be overwhelming. Here are some strategies from managers who have successfully supported returning team members...\n\nKey Tips:\n1. Don't try to catch up on everything in the first week\n2. Schedule 1:1s with your key stakeholders\n3. Ask your manager about any team changes that happened while you were away\n4. Set realistic expectations for yourself and communicate them clearly",
    mediaType: "article",
    targetPhase: "reentry",
    publishedAt: "2026-02-20",
  },
  {
    id: "2",
    title: "Setting Up a Pumping Schedule That Works",
    body: "Managing pumping at work requires planning and boundary-setting. Here's a practical guide...\n\nPractical Steps:\n- Block your calendar for pumping sessions before your first day back\n- Test your pump setup at home to know exactly how long sessions take\n- Have a backup plan (manual pump, freezer stash)\n- Know your legal rights — your employer must provide time and space",
    mediaType: "article",
    targetPhase: "reentry",
    publishedAt: "2026-02-18",
  },
  {
    id: "3",
    title: "5-Minute Desk Stretches for Returning Moms",
    body: "Short video demonstrating quick stretches you can do at your desk to relieve tension from sitting, pumping, and carrying a baby.",
    mediaType: "video",
    targetPhase: "all",
    publishedAt: "2026-02-15",
  },
  {
    id: "4",
    title: "Financial Planning Checklist for New Parents",
    body: "A comprehensive PDF checklist covering insurance updates, tax advantages, childcare budgeting, and emergency fund planning.",
    mediaType: "pdf",
    targetPhase: "all",
    publishedAt: "2026-02-10",
  },
  {
    id: "5",
    title: "Talking to Your Partner About the Mental Load",
    body: "An audio guide walking through how to have productive conversations about sharing household responsibilities, with scripts and examples.",
    mediaType: "audio",
    targetPhase: "leave",
    publishedAt: "2026-02-05",
  },
];

export default function ContentFeedPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Your Content Feed</h1>
          <p className="text-muted-foreground mt-1">
            Curated content matched to your current phase — articles, videos, and resources from your HR team
          </p>
        </div>

        <div className="space-y-4">
          {sampleContent.map((item) => {
            const Icon = mediaTypeIcons[item.mediaType] || FileText;
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-lavender-100 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          <Badge variant="outline">{item.mediaType}</Badge>
                          <Badge variant="secondary">{item.targetPhase}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                        {item.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Published {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
