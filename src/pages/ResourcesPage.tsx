import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, ExternalLink, Scale, Heart, Briefcase, Baby, DollarSign, Users } from "lucide-react";

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

const resources = [
  { id: "1", title: "FMLA Rights Guide", description: "Complete guide to your rights under the Family and Medical Leave Act, including state-specific extensions.", category: "legal", type: "PDF" },
  { id: "2", title: "Pumping at Work: Your Legal Rights", description: "Federal and state laws protecting your right to pump breast milk at work, including room requirements.", category: "legal", type: "PDF" },
  { id: "3", title: "5-Minute Mindfulness for Busy Moms", description: "Quick guided meditations designed for working mothers, can be done at your desk or during a break.", category: "wellness", type: "Audio" },
  { id: "4", title: "Postpartum Wellness Checklist", description: "Physical and emotional wellness checklist for the first year after giving birth.", category: "wellness", type: "PDF" },
  { id: "5", title: "Salary Negotiation Playbook", description: "Step-by-step guide to negotiating your salary, with special sections for post-leave negotiations.", category: "career", type: "PDF" },
  { id: "6", title: "LinkedIn Profile Optimization Guide", description: "How to update your LinkedIn profile during and after maternity leave to maintain visibility.", category: "career", type: "Article" },
  { id: "7", title: "Childcare Options Comparison Tool", description: "Compare daycare, nanny, au pair, and family care options with cost calculations.", category: "childcare", type: "Interactive" },
  { id: "8", title: "Backup Childcare Resources", description: "Emergency and backup childcare services available in your area, plus tips for building a care village.", category: "childcare", type: "Directory" },
  { id: "9", title: "New Parent Financial Planner", description: "Budgeting template specifically designed for new parents, covering insurance, childcare, and savings.", category: "financial", type: "Spreadsheet" },
  { id: "10", title: "Tax Benefits for Working Parents", description: "Complete guide to child tax credits, dependent care FSAs, and other tax advantages.", category: "financial", type: "PDF" },
  { id: "11", title: "Working Moms Network", description: "Connect with local and online communities of working mothers for support and networking.", category: "community", type: "Directory" },
  { id: "12", title: "Mentorship Matching Guide", description: "How to find and connect with mentors who understand the working parent experience.", category: "community", type: "Article" },
];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredResources = resources.filter((r) => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = ["all", ...Object.keys(categoryIcons)];

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
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm">{resource.title}</h3>
                        <Badge variant="outline" className="text-xs shrink-0">{resource.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3 w-3" /> View Resource
                      </Button>
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
