import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Building2, UserPlus, ClipboardCheck, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Legal",
  "Education",
  "Retail",
  "Manufacturing",
  "Professional Services",
  "Other",
];

const EMPLOYEE_COUNTS = ["1-50", "51-200", "201-500", "501-1000", "1000+"];

const STEP_LABELS = ["Company Info", "HR Admin Account", "Review & Submit"];

interface CompanyInfo {
  companyName: string;
  domain: string;
  industry: string;
  employeeCount: string;
  maternityLeaveCount: string;
}

interface AdminInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  password: string;
  confirmPassword: string;
}

export default function CompanySignupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    domain: "",
    industry: "",
    employeeCount: "",
    maternityLeaveCount: "",
  });

  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    password: "",
    confirmPassword: "",
  });

  const progressValue = ((currentStep + 1) / 3) * 100;

  const validateStep1 = (): boolean => {
    if (!companyInfo.companyName.trim()) {
      toast.error("Company name is required.");
      return false;
    }
    if (!companyInfo.domain.trim()) {
      toast.error("Company website domain is required.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!adminInfo.firstName.trim()) {
      toast.error("First name is required.");
      return false;
    }
    if (!adminInfo.lastName.trim()) {
      toast.error("Last name is required.");
      return false;
    }
    if (!adminInfo.email.trim()) {
      toast.error("Work email is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminInfo.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!adminInfo.password) {
      toast.error("Password is required.");
      return false;
    }
    if (adminInfo.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return false;
    }
    if (adminInfo.password !== adminInfo.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create company row
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyInfo.companyName.trim(),
          domain: companyInfo.domain.trim(),
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. Sign up the auth user
      const fullName = `${adminInfo.firstName.trim()} ${adminInfo.lastName.trim()}`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminInfo.email.trim(),
        password: adminInfo.password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      // 3. Upsert profile with company_id and role
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            company_id: companyData.id,
            role: "hr_admin",
            full_name: fullName,
            email: adminInfo.email.trim(),
          });

        if (profileError) throw profileError;
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-lavender-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="text-xl font-bold text-primary">elevateHer</span>
          </div>
        </header>
        <div className="flex items-center justify-center px-4 py-20">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to elevateHer</CardTitle>
              <CardDescription className="text-base mt-2">
                Your account is being set up. You'll receive a confirmation email shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")} className="mt-2">
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-lavender-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <span className="text-xl font-bold text-primary">elevateHer</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Page title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Company Sign Up</h1>
          <p className="text-muted-foreground mt-2">
            Set up your company on elevateHer in just a few steps.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  i <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    i < currentStep
                      ? "bg-primary text-primary-foreground"
                      : i === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {/* Step 1: Company Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Company Information</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company-name"
                    placeholder="Acme Corporation"
                    value={companyInfo.companyName}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">
                    Company Website Domain <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="domain"
                    placeholder="acmecorp.com"
                    value={companyInfo.domain}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, domain: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={companyInfo.industry}
                    onValueChange={(val) =>
                      setCompanyInfo({ ...companyInfo, industry: val })
                    }
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-count">Number of Employees</Label>
                  <Select
                    value={companyInfo.employeeCount}
                    onValueChange={(val) =>
                      setCompanyInfo({ ...companyInfo, employeeCount: val })
                    }
                  >
                    <SelectTrigger id="employee-count">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_COUNTS.map((count) => (
                        <SelectItem key={count} value={count}>
                          {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maternity-count">
                    Approximate number on maternity leave per year
                  </Label>
                  <Input
                    id="maternity-count"
                    type="number"
                    min={0}
                    placeholder="e.g. 15"
                    value={companyInfo.maternityLeaveCount}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        maternityLeaveCount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 2: HR Admin Account */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">HR Admin Account</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="first-name"
                      placeholder="Jane"
                      value={adminInfo.firstName}
                      onChange={(e) =>
                        setAdminInfo({ ...adminInfo, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="last-name"
                      placeholder="Smith"
                      value={adminInfo.lastName}
                      onChange={(e) =>
                        setAdminInfo({ ...adminInfo, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work-email">
                    Work Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="work-email"
                    type="email"
                    placeholder="jane@acmecorp.com"
                    value={adminInfo.email}
                    onChange={(e) =>
                      setAdminInfo({ ...adminInfo, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={adminInfo.phone}
                      onChange={(e) =>
                        setAdminInfo({ ...adminInfo, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input
                      id="job-title"
                      placeholder="HR Director"
                      value={adminInfo.jobTitle}
                      onChange={(e) =>
                        setAdminInfo({ ...adminInfo, jobTitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={adminInfo.password}
                    onChange={(e) =>
                      setAdminInfo({ ...adminInfo, password: e.target.value })
                    }
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={adminInfo.confirmPassword}
                    onChange={(e) =>
                      setAdminInfo({ ...adminInfo, confirmPassword: e.target.value })
                    }
                    required
                    minLength={8}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Review & Submit</h2>
                </div>

                <p className="text-sm text-muted-foreground">
                  Please review the information below before submitting your request.
                </p>

                {/* Company summary */}
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="font-medium">Company Name:</span>{" "}
                      {companyInfo.companyName}
                    </div>
                    <div>
                      <span className="font-medium">Domain:</span>{" "}
                      {companyInfo.domain}
                    </div>
                    {companyInfo.industry && (
                      <div>
                        <span className="font-medium">Industry:</span>{" "}
                        {companyInfo.industry}
                      </div>
                    )}
                    {companyInfo.employeeCount && (
                      <div>
                        <span className="font-medium">Employees:</span>{" "}
                        {companyInfo.employeeCount}
                      </div>
                    )}
                    {companyInfo.maternityLeaveCount && (
                      <div>
                        <span className="font-medium">Maternity Leave / Year:</span>{" "}
                        {companyInfo.maternityLeaveCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin summary */}
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    HR Admin Account
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {adminInfo.firstName} {adminInfo.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {adminInfo.email}
                    </div>
                    {adminInfo.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {adminInfo.phone}
                      </div>
                    )}
                    {adminInfo.jobTitle && (
                      <div>
                        <span className="font-medium">Job Title:</span>{" "}
                        {adminInfo.jobTitle}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) =>
                      setAgreedToTerms(checked === true)
                    }
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the elevateHer Terms of Service and Privacy Policy
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {currentStep > 0 ? (
                <Button variant="outline" onClick={handleBack} disabled={submitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 2 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !agreedToTerms}
                >
                  {submitting ? "Submitting..." : "Request Access"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
