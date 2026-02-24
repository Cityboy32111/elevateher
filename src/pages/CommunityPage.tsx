import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Heart, Plus, Send, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["general", "tips", "wins", "venting", "questions"] as const;

const categoryColors: Record<string, string> = {
  general: "bg-gray-100 text-gray-700",
  tips: "bg-blue-100 text-blue-700",
  wins: "bg-green-100 text-green-700",
  venting: "bg-red-100 text-red-700",
  questions: "bg-amber-100 text-amber-700",
};

interface Post {
  id: string;
  author: string;
  isAnonymous: boolean;
  category: string;
  title: string;
  body: string;
  likes: number;
  liked: boolean;
  replies: Array<{ id: string; author: string; isAnonymous: boolean; body: string; createdAt: string }>;
  createdAt: string;
}

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [newPostAnonymous, setNewPostAnonymous] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData, error } = await supabase
      .from("community_posts")
      .select("*, author:profiles!community_posts_author_id_fkey(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      return;
    }

    const postsWithReplies: Post[] = [];
    for (const post of postsData || []) {
      const { data: repliesData } = await supabase
        .from("community_replies")
        .select("*, author:profiles!community_replies_author_id_fkey(full_name)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      postsWithReplies.push({
        id: post.id,
        author: post.is_anonymous ? "Anonymous Mom" : (post.author?.full_name || "User"),
        isAnonymous: post.is_anonymous,
        category: post.category,
        title: post.title,
        body: post.body,
        likes: post.likes_count || 0,
        liked: false,
        replies: (repliesData || []).map((r: any) => ({
          id: r.id,
          author: r.is_anonymous ? "Anonymous Mom" : (r.author?.full_name || "User"),
          isAnonymous: r.is_anonymous,
          body: r.body,
          createdAt: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        })),
        createdAt: new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }

    setPosts(postsWithReplies);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.category === filter);

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, liked: !prev.liked, likes: prev.liked ? prev.likes - 1 : prev.likes + 1 } : null
      );
    }

    const post = posts.find((p) => p.id === postId);
    if (post) {
      const newCount = post.liked ? post.likes - 1 : post.likes + 1;
      await supabase.from("community_posts").update({ likes_count: newCount }).eq("id", postId);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim() || !user) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        author_id: user.id,
        company_id: profile?.company_id || null,
        category: newPostCategory,
        title: newPostTitle.trim(),
        body: newPostBody.trim(),
        is_anonymous: newPostAnonymous,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
      setSubmitting(false);
      return;
    }

    const newPost: Post = {
      id: data.id,
      author: newPostAnonymous ? "Anonymous Mom" : (profile?.full_name || "You"),
      isAnonymous: newPostAnonymous,
      category: newPostCategory,
      title: newPostTitle.trim(),
      body: newPostBody.trim(),
      likes: 0,
      liked: false,
      replies: [],
      createdAt: "Just now",
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostTitle("");
    setNewPostBody("");
    setNewPostAnonymous(false);
    setShowNewPost(false);
    setSubmitting(false);
    toast.success("Post created!");
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedPost || !user) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("community_replies")
      .insert({
        post_id: selectedPost.id,
        author_id: user.id,
        body: replyText.trim(),
        is_anonymous: replyAnonymous,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating reply:", error);
      toast.error("Failed to post reply. Please try again.");
      setSubmitting(false);
      return;
    }

    const reply = {
      id: data.id,
      author: replyAnonymous ? "Anonymous Mom" : (profile?.full_name || "You"),
      isAnonymous: replyAnonymous,
      body: replyText.trim(),
      createdAt: "Just now",
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPost.id ? { ...p, replies: [...p.replies, reply] } : p
      )
    );
    setSelectedPost((prev) => prev ? { ...prev, replies: [...prev.replies, reply] } : null);
    setReplyText("");
    setReplyAnonymous(false);
    setSubmitting(false);
    toast.success("Reply posted!");
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

  if (selectedPost) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedPost(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Community
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{selectedPost.isAnonymous ? "?" : selectedPost.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{selectedPost.author}</p>
                  <p className="text-xs text-muted-foreground">{selectedPost.createdAt}</p>
                </div>
                <Badge className={categoryColors[selectedPost.category]}>{selectedPost.category}</Badge>
              </div>
              <CardTitle className="mt-3">{selectedPost.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedPost.body}</p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={() => handleLike(selectedPost.id)}>
                  <Heart className={`h-4 w-4 mr-1 ${selectedPost.liked ? "fill-red-500 text-red-500" : ""}`} />
                  {selectedPost.likes}
                </Button>
                <span className="text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 inline mr-1" /> {selectedPost.replies.length} replies
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold">Replies</h3>
            {selectedPost.replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{reply.isAnonymous ? "?" : reply.author[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{reply.author}</span>
                    <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{reply.body}</p>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="pt-4 space-y-3">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={replyAnonymous} onCheckedChange={setReplyAnonymous} id="reply-anon" />
                    <Label htmlFor="reply-anon" className="text-sm">Reply anonymously</Label>
                  </div>
                  <Button onClick={handleReply} disabled={!replyText.trim() || submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Community</h1>
            <p className="text-muted-foreground mt-1">A safe space for tips, wins, venting, and peer support</p>
          </div>
          <Button onClick={() => setShowNewPost(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        </div>

        {showNewPost && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Create a Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Post title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
              <Textarea placeholder="Share your thoughts..." value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} rows={4} />
              <div className="flex items-center gap-4 flex-wrap">
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch checked={newPostAnonymous} onCheckedChange={setNewPostAnonymous} id="post-anon" />
                  <Label htmlFor="post-anon" className="text-sm">Post anonymously</Label>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
                  <Button onClick={handleCreatePost} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          {categories.map((c) => (
            <Button key={c} variant={filter === c ? "default" : "outline"} size="sm" onClick={() => setFilter(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share something with your community!</p>
            </div>
          )}
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPost(post)}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{post.isAnonymous ? "?" : post.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                  </div>
                  <Badge className={categoryColors[post.category]}>{post.category}</Badge>
                </div>
                <h3 className="font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}>
                    <Heart className={`h-4 w-4 ${post.liked ? "fill-red-500 text-red-500" : ""}`} /> {post.likes}
                  </button>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> {post.replies.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
