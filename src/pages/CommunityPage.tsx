import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Heart, Plus, Send, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";

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

const samplePosts: Post[] = [
  { id: "1", author: "Sarah M.", isAnonymous: false, category: "wins", title: "First week back went better than expected!", body: "I was so nervous about returning, but my team was incredibly supportive. My manager had a whole re-onboarding plan ready. Sharing this for anyone who's dreading day one — it might surprise you!", likes: 12, liked: false, replies: [{ id: "r1", author: "Anonymous Mom", isAnonymous: true, body: "This gives me so much hope! I go back next month.", createdAt: "2h ago" }], createdAt: "5h ago" },
  { id: "2", author: "Anonymous Mom", isAnonymous: true, category: "venting", title: "Pumping at work is a nightmare", body: "My company says they support nursing mothers but the 'wellness room' is a converted closet with no lock. I've been interrupted twice this week. I know I have rights but I'm too tired to fight.", likes: 24, liked: false, replies: [{ id: "r2", author: "Jessica K.", isAnonymous: false, body: "I'm so sorry. You deserve better. If it helps, the Scripts section has a great template for requesting proper accommodations.", createdAt: "1h ago" }, { id: "r3", author: "Anonymous Mom", isAnonymous: true, body: "Same situation here. I started using the script from this app and things improved. Sending you strength.", createdAt: "45m ago" }], createdAt: "1d ago" },
  { id: "3", author: "Maria L.", isAnonymous: false, category: "tips", title: "Game-changer: meal prepping on Sundays", body: "I know this sounds basic but having a whole week of lunches ready has reduced my morning stress by 80%. I spend 2 hours on Sunday and I'm set. Happy to share my go-to recipes!", likes: 18, liked: false, replies: [], createdAt: "2d ago" },
  { id: "4", author: "Anonymous Mom", isAnonymous: true, category: "questions", title: "How to handle 'so who's watching the baby?' questions?", body: "Every time I'm in a meeting someone asks who's watching my baby. Nobody asks my husband this. How do you all handle it without sounding defensive?", likes: 31, liked: false, replies: [{ id: "r4", author: "Karen W.", isAnonymous: false, body: "I say 'She's in great hands!' with a big smile and redirect. It's not their business.", createdAt: "3h ago" }], createdAt: "3d ago" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState(samplePosts);
  const [filter, setFilter] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [newPostAnonymous, setNewPostAnonymous] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);

  const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.category === filter);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: newPostAnonymous ? "Anonymous Mom" : "You",
      isAnonymous: newPostAnonymous,
      category: newPostCategory,
      title: newPostTitle,
      body: newPostBody,
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
    toast.success("Post created!");
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedPost) return;
    const reply = {
      id: Date.now().toString(),
      author: replyAnonymous ? "Anonymous Mom" : "You",
      isAnonymous: replyAnonymous,
      body: replyText,
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
    toast.success("Reply posted!");
  };

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

          {/* Replies */}
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

            {/* Reply Form */}
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
                  <Button onClick={handleReply} disabled={!replyText.trim()}>
                    <Send className="mr-2 h-4 w-4" /> Reply
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

        {/* New Post Form */}
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
                  <Button onClick={handleCreatePost}>Post</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          {categories.map((c) => (
            <Button key={c} variant={filter === c ? "default" : "outline"} size="sm" onClick={() => setFilter(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
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
