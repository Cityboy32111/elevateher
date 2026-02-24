import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ContentItem {
  id: string;
  title: string;
  body: string;
  mediaType: string;
  targetPhase: string;
  published: boolean;
  createdAt: string;
}

export default function ContentManagerPage() {
  const { user, profile } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", mediaType: "article", targetPhase: "all", published: false });
  const [saving, setSaving] = useState(false);

  const fetchContent = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching content:", error);
      setLoading(false);
      return;
    }

    setContent(
      (data || []).map((c) => ({
        id: c.id,
        title: c.title,
        body: c.body || "",
        mediaType: c.media_type || "article",
        targetPhase: c.target_phase || "all",
        published: c.published,
        createdAt: c.created_at.split("T")[0],
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [profile?.company_id]);

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

  const handleSave = async () => {
    if (!form.title.trim() || !user || !profile?.company_id) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("content")
        .update({
          title: form.title,
          body: form.body,
          media_type: form.mediaType,
          target_phase: form.targetPhase,
          published: form.published,
          published_at: form.published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        console.error("Error updating content:", error);
        toast.error("Failed to update content");
        setSaving(false);
        return;
      }
      toast.success("Content updated!");
    } else {
      const { error } = await supabase.from("content").insert({
        company_id: profile.company_id,
        author_id: user.id,
        title: form.title,
        body: form.body,
        media_type: form.mediaType,
        target_phase: form.targetPhase,
        published: form.published,
        published_at: form.published ? new Date().toISOString() : null,
      });

      if (error) {
        console.error("Error creating content:", error);
        toast.error("Failed to create content");
        setSaving(false);
        return;
      }
      toast.success("Content created!");
    }

    resetForm();
    setSaving(false);
    fetchContent();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("content").delete().eq("id", id);
    if (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
      return;
    }
    setContent((prev) => prev.filter((c) => c.id !== id));
    toast.success("Content deleted");
  };

  const togglePublish = async (id: string) => {
    const item = content.find((c) => c.id === id);
    if (!item) return;
    const newPublished = !item.published;

    const { error } = await supabase
      .from("content")
      .update({
        published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error toggling publish:", error);
      toast.error("Failed to update publish status");
      return;
    }
    setContent((prev) => prev.map((c) => c.id === id ? { ...c, published: newPublished } : c));
    toast.success(newPublished ? "Content published" : "Content unpublished");
  };

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
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {content.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No content created yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first piece of content to share with employees.</p>
          </div>
        ) : (
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
                        <td className="py-3 px-4"><Badge variant="outline">{item.mediaType}</Badge></td>
                        <td className="py-3 px-4"><Badge variant="secondary">{item.targetPhase}</Badge></td>
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
        )}
      </div>
    </AppLayout>
  );
}
