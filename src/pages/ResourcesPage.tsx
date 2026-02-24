import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, ExternalLink, Scale, Heart, Briefcase, Baby, DollarSign, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categoryIcons: Record<string, React.ElementType> = {
  legal: Scale,
  wellness: Heart,
  career: Briefcase,
  childcare: Baby,
  financial: DollarSign,
  community: Users,
};

const categoryColors: Record<string, string> = {
  legal: "bg-blue-100 text-blue-700",
  wellness: "bg-pink-100 text-pink-700",
  career: "bg-purple-100 text-purple-700",
  childcare: "bg-amber-100 text-amber-700",
  financial: "bg-green-100 text-green-700",
  community: "bg-indigo-100 text-indigo-700",
};

const fallbackResources = [
  { id: "1", title: "FMLA Rights Guide", description: "Complete guide to your rights under the Family and Medical Leave Act, including state-specific extensions.", category: "legal", file_url: null, external_url: null },
  { id: "2", title: "Pumping at Work: Your Legal Rights", description: "Federal and state laws protecting your right to pump breast milk at work, including room requirements.", category: "legal", file_url: null, external_url: null },
  { id: "3", title: "5-Minute Mindfulness for Busy Moms", description: "Quick guided meditations designed for working mothers, can be done at your desk or during a break.", category: "wellness", file_url: null, external_url: null },
  { id: "4", title: "Postpartum Wellness Checklist", description: "Physical and emotional wellness checklist for the first year after giving birth.", category: "wellness", file_url: null, external_url: null },
  { id: "5", title: "Salary Negotiation Playbook", description: "Step-by-step guide to negotiating your salary, with special sections for post-leave negotiations.", category: "career", file_url: null, external_url: null },
  { id: "6", title: "LinkedIn Profile Optimization Guide", description: "How to update your LinkedIn profile during and after maternity leave to maintain visibility.", category: "career", file_url: null, external_url: null },
  { id: "7", title: "Childcare Options Comparison Tool", description: "Compare daycare, nanny, au pair, and family care options with cost calculations.", category: "childcare", file_url: null, external_url: null },
  { id: "8", title: "Backup Childcare Resources", description: "Emergency and backup childcare services available in your area, plus tips for building a care village.", category: "childcare", file_url: null, external_url: null },
  { id: "9", title: "New Parent Financial Planner", description: "Budgeting template specifically designed for new parents, covering insurance, childcare, and savings.", category: "financial", file_url: null, external_url: null },
  { id: "10", title: "Tax Benefits for Working Parents", description: "Complete guide to child tax credits, dependent care FSAs, and other tax advantages.", category: "financial", file_url: null, external_url: null },
  { id: "11", title: "Working Moms Network", description: "Connect with local and online communities of working mothers for support and networking.", category: "community", file_url: null, external_url: null },
  { id: "12", title: "Mentorship Matching Guide", description: "How to find and connect with mentors who understand the working parent experience.", category: "community", file_url: null, external_url: null },
];

interface ResourceItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  external_url: string | null;
}

export default function ResourcesPage() {
  const { profile } = useAuth();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);

      let query = supabase.from("resources").select("*").order("created_at", { ascending: false });

      if (profile?.company_id) {
        query = query.eq("company_id", profile.company_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching resources:", error);
        setResources(fallbackResources);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setResources(data);
      } else {
        setResources(fallbackResources);
      }
      setLoading(false);
    };

    fetchResources();
  }, [profile?.company_id]);

  const filteredResources = resources.filter((r) => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = ["all", ...Object.keys(categoryIcons)];

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
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground mt-1">Curated resources to support every aspect of your journey</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {allCategories.map((c) => (
            <Button key={c} variant={activeCategory === c ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(c)}>
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource) => {
            const Icon = categoryIcons[resource.category] || Heart;
            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${categoryColors[resource.category] || "bg-gray-100"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-sm">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      )}
                      {resource.external_url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" /> Open Resource
                          </a>
                        </Button>
                      ) : resource.file_url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-3 w-3" /> Download
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Download className="mr-2 h-3 w-3" /> View Resource
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredResources.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
