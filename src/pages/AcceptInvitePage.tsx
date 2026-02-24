import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyInvitation } from "@/integrations/supabase/types";

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<CompanyInvitation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError("No invitation token provided. Please check the link you were sent.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("company_invitations")
          .select("*, company:companies(*)")
          .eq("token", token)
          .single();

        if (fetchError || !data) {
          setError(
            "This invitation link is invalid or has expired. Please contact your HR administrator."
          );
          setLoading(false);
          return;
        }

        const invitation = data as CompanyInvitation;

        // Check if already accepted
        if (invitation.accepted) {
          setError(
            "This invitation has already been accepted. Please sign in to access your account."
          );
          setLoading(false);
          return;
        }

        // Check if expired
        const expiresAt = new Date(invitation.expires_at);
        if (expiresAt < new Date()) {
          setError(
            "This invitation link is invalid or has expired. Please contact your HR administrator."
          );
          setLoading(false);
          return;
        }

        setInvitation(invitation);
      } catch {
        setError("Something went wrong while loading the invitation. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Last name is required.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!invitation) return;

    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      // 2. Upsert profile with company_id and role from invitation
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            company_id: invitation.company_id,
            role: invitation.role,
            full_name: fullName,
            email: invitation.email,
          });

        if (profileError) throw profileError;
      }

      // 3. Mark invitation as accepted
      const { error: updateError } = await supabase
        .from("company_invitations")
        .update({
          accepted: true,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      toast.success("Welcome to elevateHer!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-lavender-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="text-xl font-bold text-primary">elevateHer</span>
          </div>
        </header>
        <div className="flex items-center justify-center px-4 py-20">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Verifying your invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-lavender-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="text-xl font-bold text-primary">elevateHer</span>
          </div>
        </header>
        <div className="flex items-center justify-center px-4 py-20">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Invitation Error</CardTitle>
              <CardDescription className="text-base mt-2">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate("/auth")}>
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Valid invitation - show account creation form
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-lavender-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <span className="text-xl font-bold text-primary">elevateHer</span>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription className="text-base mt-1">
              {invitation?.company?.name
                ? `You've been invited to join ${invitation.company.name} on elevateHer.`
                : "You've been invited to join elevateHer."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={invitation?.email ?? ""}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-first-name">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="invite-first-name"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-last-name">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="invite-last-name"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invite-password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-confirm-password">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invite-confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
