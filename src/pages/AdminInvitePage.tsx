import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Send,
  RefreshCw,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { CompanyInvitation, AppRole } from "@/integrations/supabase/types";

export default function AdminInvitePage() {
  const { user, profile } = useAuth();

  // Invite form state
  const [emailList, setEmailList] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("mom");
  const [personalMessage, setPersonalMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Invitations list state
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  // Cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<CompanyInvitation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Resend loading state
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!profile?.company_id) return;

    setLoadingInvitations(true);
    try {
      const { data, error } = await supabase
        .from("company_invitations")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invitations:", error);
        toast.error("Failed to load invitations");
        return;
      }

      setInvitations((data as CompanyInvitation[]) || []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      toast.error("Failed to load invitations");
    } finally {
      setLoadingInvitations(false);
    }
  }, [profile?.company_id]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const parseEmails = (raw: string): string[] => {
    return raw
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes("@"));
  };

  const handleSendInvitations = async () => {
    const emails = parseEmails(emailList);

    if (emails.length === 0) {
      toast.error("Please enter at least one valid email address");
      return;
    }

    if (!profile?.company_id || !user?.id) {
      toast.error("Unable to send invitations. Please try again.");
      return;
    }

    setSending(true);
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const records = emails.map((email) => ({
        company_id: profile.company_id as string,
        email,
        role: selectedRole as AppRole,
        invited_by: user.id,
        token: crypto.randomUUID(),
        expires_at: expiresAt.toISOString(),
      }));

      const { error } = await supabase
        .from("company_invitations")
        .insert(records);

      if (error) {
        console.error("Error sending invitations:", error);
        toast.error("Failed to send invitations. Please try again.");
        return;
      }

      toast.success(`Invitations sent to ${emails.length} employee${emails.length > 1 ? "s" : ""}`);
      setEmailList("");
      setPersonalMessage("");
      setSelectedRole("mom");
      fetchInvitations();
    } catch (err) {
      console.error("Error sending invitations:", err);
      toast.error("Failed to send invitations. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (invitation: CompanyInvitation) => {
    if (!profile?.company_id || !user?.id) return;

    setResendingId(invitation.id);
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from("company_invitations")
        .update({
          token: crypto.randomUUID(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", invitation.id);

      if (error) {
        console.error("Error resending invitation:", error);
        toast.error("Failed to resend invitation");
        return;
      }

      toast.success(`Invitation resent to ${invitation.email}`);
      fetchInvitations();
    } catch (err) {
      console.error("Error resending invitation:", err);
      toast.error("Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  const handleCancelClick = (invitation: CompanyInvitation) => {
    setCancelTarget(invitation);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from("company_invitations")
        .delete()
        .eq("id", cancelTarget.id);

      if (error) {
        console.error("Error cancelling invitation:", error);
        toast.error("Failed to cancel invitation");
        return;
      }

      toast.success(`Invitation to ${cancelTarget.email} cancelled`);
      setCancelDialogOpen(false);
      setCancelTarget(null);
      fetchInvitations();
    } catch (err) {
      console.error("Error cancelling invitation:", err);
      toast.error("Failed to cancel invitation");
    } finally {
      setCancelling(false);
    }
  };

  const getInvitationStatus = (invitation: CompanyInvitation) => {
    if (invitation.accepted) {
      return { label: "Accepted", variant: "default" as const, className: "bg-green-100 text-green-700 hover:bg-green-100" };
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return { label: "Expired", variant: "default" as const, className: "bg-red-100 text-red-700 hover:bg-red-100" };
    }
    return { label: "Pending", variant: "default" as const, className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" };
  };

  const formatRole = (role: string) => {
    switch (role) {
      case "mom":
        return "Employee";
      case "manager":
        return "Manager";
      case "hr_admin":
        return "HR Admin";
      default:
        return role;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const pendingCount = invitations.filter(
    (inv) => !inv.accepted && new Date(inv.expires_at) >= new Date()
  ).length;

  const acceptedCount = invitations.filter((inv) => inv.accepted).length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Invite Employees</h1>
            <p className="text-muted-foreground mt-1">
              Send invitations to join your company on elevateHer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> {pendingCount} Pending
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> {acceptedCount} Accepted
            </Badge>
          </div>
        </div>

        {/* Section 1: Invite by Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Invite by Email
            </CardTitle>
            <CardDescription>
              Add email addresses to send invitation links. Invitations expire after 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-list">Email Addresses</Label>
              <Textarea
                id="email-list"
                placeholder={"Enter email addresses, one per line or comma-separated:\njane@company.com\nmark@company.com, sarah@company.com"}
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple emails with commas or new lines
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-select">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mom">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personal-message">Personal Message (optional)</Label>
              <Textarea
                id="personal-message"
                placeholder="Add a personal note that will be included in the invitation email..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {parseEmails(emailList).length > 0
                  ? `${parseEmails(emailList).length} valid email${parseEmails(emailList).length > 1 ? "s" : ""} detected`
                  : "No emails entered yet"}
              </p>
              <Button onClick={handleSendInvitations} disabled={sending || parseEmails(emailList).length === 0}>
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitations
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Section 2: Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Pending Invitations
            </CardTitle>
            <CardDescription>
              Track and manage all invitations sent from your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInvitations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No invitations sent yet.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the form above to invite employees to elevateHer.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Sent</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invitations.map((invitation) => {
                        const status = getInvitationStatus(invitation);
                        return (
                          <tr key={invitation.id} className="group">
                            <td className="py-3 text-sm font-medium">{invitation.email}</td>
                            <td className="py-3">
                              <Badge variant="secondary">{formatRole(invitation.role)}</Badge>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground">
                              {formatDate(invitation.created_at)}
                            </td>
                            <td className="py-3">
                              <Badge className={status.className}>{status.label}</Badge>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!invitation.accepted && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleResend(invitation)}
                                      disabled={resendingId === invitation.id}
                                    >
                                      {resendingId === invitation.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-4 w-4" />
                                      )}
                                      <span className="ml-1">Resend</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => handleCancelClick(invitation)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="ml-1">Cancel</span>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-3">
                  {invitations.map((invitation) => {
                    const status = getInvitationStatus(invitation);
                    return (
                      <div
                        key={invitation.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{invitation.email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Sent {formatDate(invitation.created_at)}
                            </p>
                          </div>
                          <Badge className={status.className}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{formatRole(invitation.role)}</Badge>
                          {!invitation.accepted && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResend(invitation)}
                                disabled={resendingId === invitation.id}
                              >
                                {resendingId === invitation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                                <span className="ml-1 text-xs">Resend</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleCancelClick(invitation)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-1 text-xs">Cancel</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the invitation to{" "}
              <span className="font-medium text-foreground">{cancelTarget?.email}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              Keep Invitation
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
