import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard, Users, Calendar, Download, ExternalLink,
  DollarSign, TrendingUp, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface SubscriptionData {
  planName: string;
  status: "active" | "trialing" | "past_due" | "cancelled";
  seatsIncluded: number;
  seatsUsed: number;
  annualContractValue: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextRenewalDate: Date;
  trialEnd: Date | null;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending";
}

interface EmployeeUsage {
  name: string;
  sessions: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  trialing: "bg-blue-100 text-blue-700 border-blue-200",
  past_due: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past Due",
  cancelled: "Cancelled",
};

const sampleInvoices: Invoice[] = [
  { id: "inv_001", date: new Date(2026, 1, 1), amount: 70000, status: "paid" },
  { id: "inv_002", date: new Date(2026, 0, 1), amount: 70000, status: "paid" },
];

const sampleEmployeeUsage: EmployeeUsage[] = [
  { name: "Sarah", sessions: 4 },
  { name: "Jessica", sessions: 3 },
  { name: "Amanda", sessions: 2 },
  { name: "Maria", sessions: 3 },
  { name: "Emily", sessions: 3 },
  { name: "Rachel", sessions: 2 },
  { name: "Lauren", sessions: 4 },
  { name: "Nicole", sessions: 3 },
];

const COST_PER_SESSION = 200;

export default function BillingPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices] = useState<Invoice[]>(sampleInvoices);
  const [employeeUsage] = useState<EmployeeUsage[]>(sampleEmployeeUsage);

  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true);
      try {
        // Attempt to fetch seat usage from profiles with role 'mom' for this company
        let seatsUsed = 4;
        if (profile?.company_id) {
          const { count, error } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("company_id", profile.company_id)
            .eq("role", "mom");

          if (!error && count !== null) {
            seatsUsed = count;
          }
        }

        // Default to sample subscription data (trialing)
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 14);

        setSubscription({
          planName: "Enterprise",
          status: "trialing",
          seatsIncluded: 10,
          seatsUsed,
          annualContractValue: 70000,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          nextRenewalDate: trialEnd,
          trialEnd,
        });
      } catch (error) {
        console.error("Error loading billing data:", error);
        toast.error("Failed to load billing data.");
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [profile?.company_id]);

  const handleManageBilling = () => {
    toast.info("Redirecting to billing portal...");
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success(`Downloading invoice from ${format(invoice.date, "MMM d, yyyy")}...`);
  };

  const totalSessions = employeeUsage.reduce((sum, emp) => sum + emp.sessions, 0);
  const totalTherapistCosts = totalSessions * COST_PER_SESSION;
  const seatUsagePercent = subscription
    ? (subscription.seatsUsed / subscription.seatsIncluded) * 100
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">
              Manage your plan, invoices, and usage
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-8 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">
              Manage your plan, invoices, and usage
            </p>
          </div>
          <Button onClick={handleManageBilling}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Billing
          </Button>
        </div>

        {/* Section 1: Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your subscription details and seat usage</CardDescription>
                </div>
              </div>
              {subscription && (
                <Badge className={statusColors[subscription.status]}>
                  {statusLabels[subscription.status]}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscription && (
              <>
                {/* Plan Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Plan</p>
                    </div>
                    <p className="text-xl font-bold">{subscription.planName}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Annual Value</p>
                    </div>
                    <p className="text-xl font-bold">
                      ${subscription.annualContractValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">Seats</p>
                    </div>
                    <p className="text-xl font-bold">
                      {subscription.seatsUsed} of {subscription.seatsIncluded}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {subscription.status === "trialing" ? "Trial Ends" : "Next Renewal"}
                      </p>
                    </div>
                    <p className="text-xl font-bold">
                      {format(subscription.nextRenewalDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Seat Usage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Seat Usage: {subscription.seatsUsed} of {subscription.seatsIncluded} seats used
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(seatUsagePercent)}%
                    </p>
                  </div>
                  <Progress value={seatUsagePercent} className="h-3" />
                </div>

                {/* Period Information */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {subscription.status === "trialing" ? (
                    <span>
                      Trial period: {format(subscription.currentPeriodStart, "MMM d, yyyy")} -{" "}
                      {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span>
                      Current period: {format(subscription.currentPeriodStart, "MMM d, yyyy")} -{" "}
                      {format(subscription.currentPeriodEnd, "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Invoice History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>
                  View and download past invoices
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Download
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm">
                        {format(invoice.date, "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }
                        >
                          {invoice.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Invoice history will appear here once your subscription is active.
            </p>
          </CardContent>
        </Card>

        {/* Section 3: Usage This Period */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Usage This Period</CardTitle>
                <CardDescription>
                  Therapy session usage and cost breakdown
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 text-center">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-primary">{totalSessions}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 text-center">
                <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cost per Session</p>
                <p className="text-2xl font-bold text-primary">
                  ${COST_PER_SESSION}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 text-center">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Total Therapist Costs</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalTherapistCosts.toLocaleString()}
                </p>
              </div>
            </div>

            <Separator />

            {/* Sessions per Employee Breakdown */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Sessions per Employee</h3>
              <div className="space-y-3">
                {employeeUsage.map((employee) => {
                  const maxSessions = Math.max(
                    ...employeeUsage.map((e) => e.sessions)
                  );
                  const percent = (employee.sessions / maxSessions) * 100;
                  return (
                    <div key={employee.name} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{employee.name}</div>
                      <div className="flex-1">
                        <Progress value={percent} className="h-2" />
                      </div>
                      <span className="text-sm text-muted-foreground w-20 text-right">
                        {employee.sessions} {employee.sessions === 1 ? "session" : "sessions"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
