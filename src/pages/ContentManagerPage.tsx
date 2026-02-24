import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  body: string;
  mediaType: string;
  targetPhase: string;
  published: boolean;
  createdAt: string;
}

const sampleContent: ContentItem[] = [
  { id: "1", title: "Navigating Your First Week Back", body: "Your first week back doesn't have to be overwhelming...", mediaType: "article", targetPhase: "reentry", published: true, createdAt: "2026-02-20" },
  { id: "2", title: "Setting Up a Pumping Schedule", body: "Managing pumping at work requires planning...", mediaType: "article", targetPhase: "reentry", published: true, createdAt: "2026-02-18" },
  { id: "3", title: "5-Minute Desk Stretches", body: "Quick stretches for busy moms...", mediaType: "video", targetPhase: "all", published: true, createdAt: "2026-02-15" },
  { id: "4", title: "Preparing Your Team for Your Leave (Draft)", body: "Tips for a smooth handoff before maternity leave...", mediaType: "article", targetPhase: "pregnancy", published: false, createdAt: "2026-02-12" },
];

export default function ContentManagerPage() {
  const [content, setContent] = useState(sampleContent);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", mediaType: "article", targetPhase: "all", published: false });

  const resetForm = () => {
    setForm({ title: "", body: "", mediaType: "article", targetPhase: "all", published: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    setForm({ title: "", body: "", mediaType: "article", targetPhase: "all", published: false });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (item: ContentItem) => {
    setForm({ title: item.title, body: item.body, mediaType: item.mediaType, targetPhase: item.targetPhase, published: item.published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setContent((prev) => prev.map((c) => c.id === editingId ? { ...c, ...form } : c));
      toast.success("Content updated!");
    } else {
      const newItem: ContentItem = { id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split("T")[0] };
      setContent((prev) => [newItem, ...prev]);
      toast.success("Content created!");
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setContent((prev) => prev.filter((c) => c.id !== id));
    toast.success("Content deleted");
  };

  const togglePublish = (id: string) => {
    setContent((prev) => prev.map((c) => c.id === id ? { ...c, published: !c.published } : c));
    toast.success("Publish status updated");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Manager</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage content for your employees' content feed
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Content
          </Button>
        </div>

        {/* Content Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Content" : "Create Content"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the content details below" : "Fill in the details to create new content"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Content title" />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Content body..." rows={6} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Media Type</Label>
                  <Select value={form.mediaType} onValueChange={(v) => setForm((p) => ({ ...p, mediaType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["article", "video", "pdf", "image", "audio"].map((t) => (
                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Phase</Label>
                  <Select value={form.targetPhase} onValueChange={(v) => setForm((p) => ({ ...p, targetPhase: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["all", "pregnancy", "leave", "reentry", "year_back"].map((p) => (
                        <SelectItem key={p} value={p}>{p === "all" ? "All Phases" : p === "year_back" ? "Year Back" : p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm((p) => ({ ...p, published: v }))} id="publish" />
                <Label htmlFor="publish">Publish immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Content Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Phase</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{item.title}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{item.mediaType}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{item.targetPhase}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={item.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {item.published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{item.createdAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => togglePublish(item.id)} title={item.published ? "Unpublish" : "Publish"}>
                            {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Content</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
