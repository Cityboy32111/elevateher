import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  FileText,
  Upload,
  Plus,
  Trash2,
  Clock,
  Shield,
  Calendar,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// --- Constants ---

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;

const SPECIALTIES = [
  "Postpartum anxiety",
  "Postpartum depression",
  "Identity transitions",
  "Career and motherhood",
  "Relationship changes",
  "Grief and loss",
  "Work-life balance",
  "Trauma-informed care",
] as const;

const LICENSE_TYPES = [
  { value: "LCSW", label: "LCSW" },
  { value: "LPC", label: "LPC" },
  { value: "LMFT", label: "LMFT" },
  { value: "PhD/PsyD", label: "Psychologist (PhD/PsyD)" },
  { value: "LMHC", label: "LMHC" },
  { value: "Other", label: "Other" },
] as const;

const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (America/New_York)" },
  { value: "America/Chicago", label: "Central (America/Chicago)" },
  { value: "America/Denver", label: "Mountain (America/Denver)" },
  { value: "America/Los_Angeles", label: "Pacific (America/Los_Angeles)" },
  { value: "America/Anchorage", label: "Alaska (America/Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii (Pacific/Honolulu)" },
] as const;

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
] as const;

const STEP_LABELS = [
  "Personal Information",
  "License Information",
  "Insurance & Compliance",
  "Availability",
] as const;

// --- Helper: generate time slots in 30-min increments from 7:00 AM to 9:00 PM ---
function generateTimeSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (const min of [0, 30]) {
      if (hour === 21 && min === 30) break;
      const h24 = String(hour).padStart(2, "0");
      const m = String(min).padStart(2, "0");
      const value = `${h24}:${m}`;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? "PM" : "AM";
      const label = `${displayHour}:${m} ${ampm}`;
      slots.push({ value, label });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

// --- Interfaces ---

interface LicenseEntry {
  id: string;
  licenseType: string;
  state: string;
  licenseNumber: string;
  expirationDate: string;
  documentFile: File | null;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

type AvailabilityMap = Record<number, DaySchedule>;

// --- Component ---

export default function TherapistOnboardingPage() {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [licenses, setLicenses] = useState<LicenseEntry[]>([]);
  const [currentLicense, setCurrentLicense] = useState<LicenseEntry>({
    id: crypto.randomUUID(),
    licenseType: "",
    state: "",
    licenseNumber: "",
    expirationDate: "",
    documentFile: null,
  });

  // Step 3 state
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [coverageExpiration, setCoverageExpiration] = useState("");
  const [insuranceDoc, setInsuranceDoc] = useState<File | null>(null);
  const [w9Doc, setW9Doc] = useState<File | null>(null);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Step 4 state
  const [timezone, setTimezone] = useState("America/New_York");
  const [availability, setAvailability] = useState<AvailabilityMap>(() => {
    const initial: AvailabilityMap = {};
    DAYS_OF_WEEK.forEach((day) => {
      initial[day.value] = { enabled: false, startTime: "09:00", endTime: "17:00" };
    });
    return initial;
  });

  // Pre-fill name from profile
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  // --- File upload helper ---
  async function uploadFile(
    bucket: string,
    path: string,
    file: File
  ): Promise<string | null> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }

  // --- Validation ---
  function validateStep(step: number): string | null {
    switch (step) {
      case 1: {
        if (!fullName.trim()) return "Full name is required.";
        if (!phone.trim()) return "Phone number is required.";
        if (!bio.trim()) return "Professional bio is required.";
        if (bio.length > 500) return "Bio must be 500 characters or fewer.";
        if (!yearsOfExperience || Number(yearsOfExperience) < 0)
          return "Please enter your years of experience.";
        if (selectedSpecialties.length === 0)
          return "Please select at least one specialty.";
        return null;
      }
      case 2: {
        if (licenses.length === 0)
          return "Please add at least one license.";
        return null;
      }
      case 3: {
        if (!insuranceProvider.trim())
          return "Malpractice insurance provider is required.";
        if (!policyNumber.trim()) return "Policy number is required.";
        if (!coverageExpiration) return "Coverage expiration date is required.";
        if (!confirmAccuracy)
          return "Please confirm that all information is accurate.";
        if (!agreeToTerms)
          return "Please agree to the elevateHer Therapist Agreement.";
        return null;
      }
      case 4: {
        const hasAnyAvailability = Object.values(availability).some((d) => d.enabled);
        if (!hasAnyAvailability)
          return "Please set availability for at least one day.";
        for (const day of DAYS_OF_WEEK) {
          const sched = availability[day.value];
          if (sched.enabled && sched.startTime >= sched.endTime) {
            return `${day.label}: end time must be after start time.`;
          }
        }
        return null;
      }
      default:
        return null;
    }
  }

  // --- Navigation ---
  function handleNext() {
    const error = validateStep(currentStep);
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }

  function handlePrevious() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  // --- License management ---
  function handleAddLicense() {
    if (!currentLicense.licenseType) {
      toast.error("Please select a license type.");
      return;
    }
    if (!currentLicense.state) {
      toast.error("Please select a state.");
      return;
    }
    if (!currentLicense.licenseNumber.trim()) {
      toast.error("Please enter a license number.");
      return;
    }
    if (!currentLicense.expirationDate) {
      toast.error("Please enter an expiration date.");
      return;
    }
    setLicenses((prev) => [...prev, { ...currentLicense }]);
    setCurrentLicense({
      id: crypto.randomUUID(),
      licenseType: "",
      state: "",
      licenseNumber: "",
      expirationDate: "",
      documentFile: null,
    });
  }

  function handleRemoveLicense(id: string) {
    setLicenses((prev) => prev.filter((l) => l.id !== id));
  }

  // --- Profile photo ---
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  // --- Specialty toggle ---
  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  }

  // --- Availability update ---
  function updateAvailability(dayValue: number, updates: Partial<DaySchedule>) {
    setAvailability((prev) => ({
      ...prev,
      [dayValue]: { ...prev[dayValue], ...updates },
    }));
  }

  // --- Final submission ---
  async function handleSubmit() {
    const error = validateStep(4);
    if (error) {
      toast.error(error);
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload profile photo if provided
      let avatarUrl: string | null = null;
      if (profilePhoto) {
        const ext = profilePhoto.name.split(".").pop();
        const path = `${user.id}/profile.${ext}`;
        avatarUrl = await uploadFile("therapist-media", path, profilePhoto);
      }

      // 2. Upload insurance document if provided
      let insuranceDocUrl: string | null = null;
      if (insuranceDoc) {
        const ext = insuranceDoc.name.split(".").pop();
        const path = `${user.id}/insurance.${ext}`;
        insuranceDocUrl = await uploadFile("therapist-media", path, insuranceDoc);
      }

      // 3. Upload W9 if provided
      let w9Url: string | null = null;
      if (w9Doc) {
        const ext = w9Doc.name.split(".").pop();
        const path = `${user.id}/w9.${ext}`;
        w9Url = await uploadFile("therapist-media", path, w9Doc);
      }

      // 4. Update profile with bio, specialties, phone, years of experience
      const profileUpdate: Record<string, unknown> = {
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };
      if (avatarUrl) profileUpdate.avatar_url = avatarUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 5. Save each license
      for (const license of licenses) {
        let licenseDocUrl: string | null = null;
        if (license.documentFile) {
          const ext = license.documentFile.name.split(".").pop();
          const path = `${user.id}/license-${license.id}.${ext}`;
          licenseDocUrl = await uploadFile("therapist-media", path, license.documentFile);
        }

        const { error: licenseError } = await supabase
          .from("therapist_licenses")
          .insert({
            therapist_id: user.id,
            license_type: license.licenseType,
            state: license.state,
            license_number: license.licenseNumber,
            expires_on: license.expirationDate,
            license_document_url: licenseDocUrl,
            malpractice_insurance_url: insuranceDocUrl,
          });

        if (licenseError) throw licenseError;
      }

      // 6. Save availability
      const availabilityRows = DAYS_OF_WEEK.filter(
        (day) => availability[day.value].enabled
      ).map((day) => ({
        therapist_id: user.id,
        day_of_week: day.value,
        start_time: availability[day.value].startTime,
        end_time: availability[day.value].endTime,
        timezone,
        is_active: true,
      }));

      if (availabilityRows.length > 0) {
        const { error: availError } = await supabase
          .from("therapist_availability")
          .insert(availabilityRows);

        if (availError) throw availError;
      }

      setSubmitted(true);
      toast.success("Your onboarding application has been submitted successfully!");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong during submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Success Screen ---
  if (submitted) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-green-900">
                Application Submitted!
              </h2>
              <p className="text-green-800 text-lg max-w-md mx-auto">
                Your profile is under review. We'll notify you within 1-2 business days
                once your licenses are verified.
              </p>
              <p className="text-sm text-green-700">
                You will receive an email notification when your account is approved.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // --- Step Progress Indicator ---
  const progressValue = (currentStep / 4) * 100;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Therapist Onboarding</h1>
          <p className="text-muted-foreground mt-1">
            Complete your profile to start helping mothers on elevateHer
          </p>
        </div>

        {/* Step Progress Bar */}
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                Step {currentStep} of 4
              </span>
              <span className="text-sm text-muted-foreground">
                {STEP_LABELS[currentStep - 1]}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between mt-3">
              {STEP_LABELS.map((label, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                return (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* ==================== STEP 1: Personal Information ==================== */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Professional Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 500))}
                    placeholder="Tell us about your experience, approach, and what drives your work with mothers..."
                    rows={4}
                  />
                  <p
                    className={`text-xs text-right ${
                      bio.length > 450 ? "text-orange-600" : "text-muted-foreground"
                    }`}
                  >
                    {bio.length}/500 characters
                  </p>
                </div>

                {/* Profile Photo Upload */}
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {profilePhotoPreview ? (
                        <img
                          src={profilePhotoPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, or WebP. Max 5MB.
                      </p>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    max={60}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g. 8"
                    className="w-32"
                  />
                </div>

                {/* Specialties */}
                <div className="space-y-3">
                  <Label>Specialties</Label>
                  <p className="text-sm text-muted-foreground">
                    Select all areas that apply to your practice.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SPECIALTIES.map((specialty) => (
                      <div
                        key={specialty}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={selectedSpecialties.includes(specialty)}
                          onCheckedChange={() => toggleSpecialty(specialty)}
                        />
                        <Label
                          htmlFor={`specialty-${specialty}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSpecialties.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== STEP 2: License Information ==================== */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">License Information</h2>
                </div>

                {/* Added licenses list */}
                {licenses.length > 0 && (
                  <div className="space-y-3">
                    <Label>Added Licenses</Label>
                    {licenses.map((license) => {
                      const stateLabel =
                        US_STATES.find((s) => s.value === license.state)?.label ||
                        license.state;
                      const typeLabel =
                        LICENSE_TYPES.find((t) => t.value === license.licenseType)
                          ?.label || license.licenseType;
                      return (
                        <div
                          key={license.id}
                          className="flex items-center justify-between rounded-lg border p-3 bg-muted/30"
                        >
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm">
                              {typeLabel} - {stateLabel}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              #{license.licenseNumber} | Expires:{" "}
                              {license.expirationDate}
                              {license.documentFile && " | Document attached"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveLicense(license.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    <Separator />
                  </div>
                )}

                {/* Add new license form */}
                <div className="space-y-4 rounded-lg border p-4 bg-muted/10">
                  <p className="text-sm font-medium">Add a License</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* License Type */}
                    <div className="space-y-2">
                      <Label>License Type</Label>
                      <Select
                        value={currentLicense.licenseType}
                        onValueChange={(val) =>
                          setCurrentLicense((prev) => ({
                            ...prev,
                            licenseType: val,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select license type" />
                        </SelectTrigger>
                        <SelectContent>
                          {LICENSE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select
                        value={currentLicense.state}
                        onValueChange={(val) =>
                          setCurrentLicense((prev) => ({ ...prev, state: val }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* License Number */}
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={currentLicense.licenseNumber}
                        onChange={(e) =>
                          setCurrentLicense((prev) => ({
                            ...prev,
                            licenseNumber: e.target.value,
                          }))
                        }
                        placeholder="e.g. 12345678"
                      />
                    </div>

                    {/* Expiration Date */}
                    <div className="space-y-2">
                      <Label htmlFor="licenseExpiry">Expiration Date</Label>
                      <Input
                        id="licenseExpiry"
                        type="date"
                        value={currentLicense.expirationDate}
                        onChange={(e) =>
                          setCurrentLicense((prev) => ({
                            ...prev,
                            expirationDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* License Document Upload */}
                  <div className="space-y-2">
                    <Label>License Document (PDF or image)</Label>
                    <Input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCurrentLicense((prev) => ({
                          ...prev,
                          documentFile: file,
                        }));
                      }}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddLicense}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another License
                  </Button>
                </div>
              </div>
            )}

            {/* ==================== STEP 3: Insurance and Compliance ==================== */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Insurance & Compliance
                  </h2>
                </div>

                {/* Malpractice Insurance Provider */}
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">
                    Malpractice Insurance Provider
                  </Label>
                  <Input
                    id="insuranceProvider"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. HPSO, CM&F Group"
                  />
                </div>

                {/* Policy Number */}
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g. POL-1234567"
                  />
                </div>

                {/* Coverage Expiration Date */}
                <div className="space-y-2">
                  <Label htmlFor="coverageExpiry">Coverage Expiration Date</Label>
                  <Input
                    id="coverageExpiry"
                    type="date"
                    value={coverageExpiration}
                    onChange={(e) => setCoverageExpiration(e.target.value)}
                  />
                </div>

                {/* Insurance Document Upload */}
                <div className="space-y-2">
                  <Label>Insurance Document</Label>
                  <Input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setInsuranceDoc(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a copy of your malpractice insurance certificate.
                  </p>
                </div>

                {/* W9 Upload */}
                <div className="space-y-2">
                  <Label>
                    W9 Document{" "}
                    <span className="text-xs text-orange-600 font-normal">
                      (Required for payment processing)
                    </span>
                  </Label>
                  <Input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setW9Doc(e.target.files?.[0] || null)}
                  />
                </div>

                <Separator />

                {/* Confirmations */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="confirmAccuracy"
                      checked={confirmAccuracy}
                      onCheckedChange={(checked) =>
                        setConfirmAccuracy(checked === true)
                      }
                    />
                    <Label
                      htmlFor="confirmAccuracy"
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      I confirm that all information provided is accurate and
                      complete
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeTerms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) =>
                        setAgreeToTerms(checked === true)
                      }
                    />
                    <Label
                      htmlFor="agreeTerms"
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      I agree to the elevateHer Therapist Agreement
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP 4: Availability ==================== */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Availability</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set your weekly availability for client sessions.
                </p>

                {/* Timezone Selector */}
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="w-full sm:w-80">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Weekly Schedule */}
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const sched = availability[day.value];
                    return (
                      <div
                        key={day.value}
                        className="rounded-lg border p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">
                            {day.label}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {sched.enabled ? "Available" : "Unavailable"}
                            </span>
                            <Switch
                              checked={sched.enabled}
                              onCheckedChange={(checked) =>
                                updateAvailability(day.value, {
                                  enabled: checked,
                                })
                              }
                            />
                          </div>
                        </div>

                        {sched.enabled && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pl-0 sm:pl-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <Label className="text-sm whitespace-nowrap">
                                Start
                              </Label>
                              <Select
                                value={sched.startTime}
                                onValueChange={(val) =>
                                  updateAvailability(day.value, {
                                    startTime: val,
                                  })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((slot) => (
                                    <SelectItem
                                      key={`start-${day.value}-${slot.value}`}
                                      value={slot.value}
                                    >
                                      {slot.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground sm:block hidden" />
                              <Label className="text-sm whitespace-nowrap">
                                End
                              </Label>
                              <Select
                                value={sched.endTime}
                                onValueChange={(val) =>
                                  updateAvailability(day.value, {
                                    endTime: val,
                                  })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((slot) => (
                                    <SelectItem
                                      key={`end-${day.value}-${slot.value}`}
                                      value={slot.value}
                                    >
                                      {slot.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
