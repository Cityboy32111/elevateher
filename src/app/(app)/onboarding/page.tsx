"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Select, Textarea, ScaleInput, Toggle, ProgressBar } from "@/components/ui";
import { STRESSOR_OPTIONS, GOAL_OPTIONS, formatDate } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Constants
 * -------------------------------------------------------------------------- */

const TOTAL_STEPS = 5;

const STEP_TITLES = [
  "About Your Timeline",
  "About Your Work",
  "Your Support System",
  "What Matters Most",
  "Your Plan",
] as const;

const STEP_DESCRIPTIONS = [
  "Help us understand where you are in your journey so we can personalize your experience.",
  "Tell us about your work environment so we can tailor recommendations.",
  "Understanding your support helps us identify where to focus.",
  "Knowing what's on your mind helps us prioritize the right resources for you.",
  "Here's a summary of what you've shared. Ready to begin?",
] as const;

/* ---------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

interface FormData {
  babyAlreadyBorn: boolean;
  dueDate: string;
  childBirthDate: string;
  leaveStartDate: string;
  returnToWorkDate: string;
  roleLevel: string;
  roleFunction: string;
  workMode: string;
  companyType: string;
  managerSupportLevel: number | null;
  childcareSituation: string;
  supportSystem: string;
  topStressors: string[];
  topStressorsFreeText: string;
  goals: string[];
}

/* ---------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<FormData>({
    babyAlreadyBorn: false,
    dueDate: "",
    childBirthDate: "",
    leaveStartDate: "",
    returnToWorkDate: "",
    roleLevel: "",
    roleFunction: "",
    workMode: "",
    companyType: "",
    managerSupportLevel: null,
    childcareSituation: "",
    supportSystem: "",
    topStressors: [],
    topStressorsFreeText: "",
    goals: [],
  });

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(key: "topStressors" | "goals", item: string) {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(item)
          ? arr.filter((i) => i !== item)
          : [...arr, item],
      };
    });
  }

  function handleNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        leaveStartDate: form.leaveStartDate || null,
        returnToWorkDate: form.returnToWorkDate || null,
        roleLevel: form.roleLevel || null,
        roleFunction: form.roleFunction || null,
        workMode: form.workMode || null,
        companyType: form.companyType || null,
        managerSupportLevel: form.managerSupportLevel,
        childcareSituation: form.childcareSituation || null,
        supportSystem: form.supportSystem || null,
        topStressors: form.topStressors.length > 0 ? form.topStressors : null,
        topStressorsFreeText: form.topStressorsFreeText || null,
        goals: form.goals.length > 0 ? form.goals : null,
      };

      if (form.babyAlreadyBorn) {
        payload.childBirthDate = form.childBirthDate || null;
        payload.dueDate = null;
      } else {
        payload.dueDate = form.dueDate || null;
        payload.childBirthDate = null;
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D2D2D]">
            Personalize Your Journey
          </h1>
          <p className="mt-2 text-sm text-[#2D2D2D]/60">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar value={(step / TOTAL_STEPS) * 100} />
          <div className="mt-3 flex justify-between">
            {STEP_TITLES.map((title, i) => (
              <button
                key={title}
                type="button"
                onClick={() => {
                  if (i + 1 < step) setStep(i + 1);
                }}
                className={`text-xs font-medium transition-colors ${
                  i + 1 === step
                    ? "text-[#7C9A82]"
                    : i + 1 < step
                    ? "cursor-pointer text-[#2D2D2D]/50 hover:text-[#2D2D2D]/70"
                    : "text-[#2D2D2D]/25"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <Card className="mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#2D2D2D]">
              {STEP_TITLES[step - 1]}
            </h2>
            <p className="mt-1 text-sm text-[#2D2D2D]/60">
              {STEP_DESCRIPTIONS[step - 1]}
            </p>
          </div>

          {/* Step 1 - Timeline */}
          {step === 1 && (
            <div className="space-y-5">
              <Toggle
                checked={form.babyAlreadyBorn}
                onChange={(checked) => updateField("babyAlreadyBorn", checked)}
                label="My baby has already been born"
              />

              {form.babyAlreadyBorn ? (
                <Input
                  type="date"
                  label="Baby's birth date"
                  value={form.childBirthDate}
                  onChange={(e) => updateField("childBirthDate", e.target.value)}
                />
              ) : (
                <Input
                  type="date"
                  label="Due date"
                  value={form.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                />
              )}

              <Input
                type="date"
                label="Leave start date"
                value={form.leaveStartDate}
                onChange={(e) => updateField("leaveStartDate", e.target.value)}
              />

              <Input
                type="date"
                label="Expected return-to-work date"
                value={form.returnToWorkDate}
                onChange={(e) => updateField("returnToWorkDate", e.target.value)}
              />
            </div>
          )}

          {/* Step 2 - Work */}
          {step === 2 && (
            <div className="space-y-5">
              <Select
                label="Role level"
                value={form.roleLevel}
                onChange={(e) => updateField("roleLevel", e.target.value)}
              >
                <option value="">Select your level...</option>
                <option value="Individual Contributor">Individual Contributor</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
                <option value="Executive">Executive</option>
              </Select>

              <Select
                label="Role function"
                value={form.roleFunction}
                onChange={(e) => updateField("roleFunction", e.target.value)}
              >
                <option value="">Select your function...</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Legal">Legal</option>
                <option value="Other">Other</option>
              </Select>

              <Select
                label="Work mode"
                value={form.workMode}
                onChange={(e) => updateField("workMode", e.target.value)}
              >
                <option value="">Select your work mode...</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </Select>

              <Select
                label="Company type"
                value={form.companyType}
                onChange={(e) => updateField("companyType", e.target.value)}
              >
                <option value="">Select your company type...</option>
                <option value="Startup">Startup</option>
                <option value="Midsize">Midsize</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Nonprofit">Nonprofit</option>
                <option value="Government">Government</option>
              </Select>
            </div>
          )}

          {/* Step 3 - Support System */}
          {step === 3 && (
            <div className="space-y-6">
              <ScaleInput
                label="How supported do you feel by your manager?"
                value={form.managerSupportLevel}
                onChange={(value) => updateField("managerSupportLevel", value)}
                labels={[
                  "Not at all",
                  "Slightly",
                  "Somewhat",
                  "Very",
                  "Extremely",
                ]}
              />

              <Select
                label="Childcare situation"
                value={form.childcareSituation}
                onChange={(e) => updateField("childcareSituation", e.target.value)}
              >
                <option value="">Select your situation...</option>
                <option value="Set">Set - I have a plan</option>
                <option value="In Progress">In Progress - Working on it</option>
                <option value="Unknown">Unknown - Not sure yet</option>
              </Select>

              <Select
                label="Overall support system"
                value={form.supportSystem}
                onChange={(e) => updateField("supportSystem", e.target.value)}
              >
                <option value="">Select your support level...</option>
                <option value="Strong">Strong - Partner, family, friends nearby</option>
                <option value="Moderate">Moderate - Some help available</option>
                <option value="Limited">Limited - Mostly on my own</option>
              </Select>
            </div>
          )}

          {/* Step 4 - Stressors and Goals */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-[#2D2D2D]/70">
                  What are your top stressors? (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STRESSOR_OPTIONS.map((stressor) => {
                    const isSelected = form.topStressors.includes(stressor);
                    return (
                      <button
                        key={stressor}
                        type="button"
                        onClick={() => toggleArrayItem("topStressors", stressor)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-[#7C9A82] bg-[#7C9A82]/10 text-[#7C9A82] font-medium"
                            : "border-[#2D2D2D]/10 bg-white text-[#2D2D2D]/70 hover:border-[#2D2D2D]/25"
                        }`}
                      >
                        {stressor}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                label="Anything else weighing on you?"
                placeholder="Share anything else that's on your mind..."
                value={form.topStressorsFreeText}
                onChange={(e) => updateField("topStressorsFreeText", e.target.value)}
              />

              <div>
                <label className="mb-3 block text-sm font-medium text-[#2D2D2D]/70">
                  What are your goals? (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = form.goals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleArrayItem("goals", goal)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-[#8BA4B8] bg-[#8BA4B8]/10 text-[#6B8A9E] font-medium"
                            : "border-[#2D2D2D]/10 bg-white text-[#2D2D2D]/70 hover:border-[#2D2D2D]/25"
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5 - Confirmation */}
          {step === 5 && (
            <div className="space-y-5">
              <SummarySection title="Timeline">
                <SummaryItem
                  label={form.babyAlreadyBorn ? "Birth date" : "Due date"}
                  value={formatDate(form.babyAlreadyBorn ? form.childBirthDate : form.dueDate) || "Not set"}
                />
                <SummaryItem label="Leave starts" value={formatDate(form.leaveStartDate) || "Not set"} />
                <SummaryItem label="Return to work" value={formatDate(form.returnToWorkDate) || "Not set"} />
              </SummarySection>

              <SummarySection title="Work">
                <SummaryItem label="Role level" value={form.roleLevel || "Not set"} />
                <SummaryItem label="Function" value={form.roleFunction || "Not set"} />
                <SummaryItem label="Work mode" value={form.workMode || "Not set"} />
                <SummaryItem label="Company type" value={form.companyType || "Not set"} />
              </SummarySection>

              <SummarySection title="Support">
                <SummaryItem
                  label="Manager support"
                  value={form.managerSupportLevel ? `${form.managerSupportLevel} / 5` : "Not set"}
                />
                <SummaryItem label="Childcare" value={form.childcareSituation || "Not set"} />
                <SummaryItem label="Support system" value={form.supportSystem || "Not set"} />
              </SummarySection>

              <SummarySection title="Focus Areas">
                <SummaryItem
                  label="Stressors"
                  value={form.topStressors.length > 0 ? form.topStressors.join(", ") : "None selected"}
                />
                {form.topStressorsFreeText && (
                  <SummaryItem label="Additional notes" value={form.topStressorsFreeText} />
                )}
                <SummaryItem
                  label="Goals"
                  value={form.goals.length > 0 ? form.goals.join(", ") : "None selected"}
                />
              </SummarySection>
            </div>
          )}
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={step === 1 ? "invisible" : ""}
          >
            Back
          </Button>

          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Start Your Journey"}
            </Button>
          )}
        </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Summary helpers

 * -------------------------------------------------------------------------- */

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#2D2D2D]/8 p-4">
      <h4 className="mb-2 text-sm font-semibold text-[#7C9A82]">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-[#2D2D2D]/50">{label}</span>
      <span className="text-right text-[#2D2D2D]">{value}</span>
    </div>
  );
}
