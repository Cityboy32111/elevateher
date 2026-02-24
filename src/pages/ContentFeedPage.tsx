import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Video, Image, FileAudio, File, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const mediaTypeIcons: Record<string, React.ElementType> = {
  article: FileText,
  video: Video,
  image: Image,
  audio: FileAudio,
  pdf: File,
};

interface ContentItem {
  id: string;
  title: string;
  body: string | null;
  mediaType: string;
  targetPhase: string;
  publishedAt: string;
}

export default function ContentFeedPage() {
  const { profile } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      let query = supabase
        .from("content")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (profile?.company_id) {
        query = query.eq("company_id", profile.company_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching content:", error);
        setLoading(false);
        return;
      }

      setContent(
        (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          mediaType: item.media_type || "article",
          targetPhase: item.target_phase || "all",
          publishedAt: item.published_at || item.created_at,
        }))
      );
      setLoading(false);
    };

    fetchContent();
  }, [profile?.company_id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Your Content Feed</h1>
          <p className="text-muted-foreground mt-1">
            Curated content matched to your current phase — articles, videos, and resources from your HR team
          </p>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No content available yet</p>
            <p className="text-sm text-muted-foreground mt-1">Your HR team will publish content here as part of your journey.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {content.map((item) => {
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
                        {item.body && (
                          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                            {item.body}
                          </p>
                        )}
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
        )}
      </div>
    </AppLayout>
  );
}
