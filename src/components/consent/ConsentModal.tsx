import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConsent } from "@/hooks/useConsent";
import { toast } from "sonner";

const CONSENT_TEXT = `By booking a session with an elevateHer therapist, you acknowledge and agree to the following:

Services Provided: elevateHer connects you with licensed therapists who provide individual therapy services. These are clinical mental health services, not coaching or general wellness advice.

Confidentiality: Your sessions and all information you share with your therapist are strictly confidential. elevateHer does not share your session content, notes, or personal disclosures with your employer. Your employer only sees whether you are actively enrolled in the program.

Limits of Confidentiality: Confidentiality has limits required by law. Your therapist may be required to disclose information if there is an imminent risk of harm to yourself or others, suspected child abuse or elder abuse, or a court order.

Emergency Services: elevateHer is not a crisis service. If you are experiencing a mental health emergency, please call 988 (Suicide and Crisis Lifeline) or 911 immediately.

Voluntary Participation: Your participation is completely voluntary. You may stop using the service at any time.

Therapist Licensing: All therapists on the elevateHer platform are independently licensed mental health professionals. They carry their own malpractice insurance and are responsible for their clinical decisions.`;

interface ConsentModalProps {
  open: boolean;
  onConsented: () => void;
  onCancel: () => void;
}

export function ConsentModal({ open, onConsented, onCancel }: ConsentModalProps) {
  const [readChecked, setReadChecked] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { recordConsent } = useConsent();

  const canProceed = readChecked && consentChecked;

  const handleAgree = async () => {
    setSubmitting(true);
    try {
      await recordConsent("therapy_services", CONSENT_TEXT);
      toast.success("Consent recorded successfully");
      onConsented();
    } catch (error) {
      toast.error("Failed to record consent. Please try again.");
      console.error("Consent error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Before Your First Session</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            {CONSENT_TEXT.split("\n\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start gap-3">
            <Checkbox
              id="read-consent"
              checked={readChecked}
              onCheckedChange={(checked) => setReadChecked(checked === true)}
            />
            <label htmlFor="read-consent" className="text-sm cursor-pointer leading-relaxed">
              I have read and understand the above information
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
            />
            <label htmlFor="agree-consent" className="text-sm cursor-pointer leading-relaxed">
              I consent to receive therapy services through elevateHer
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleAgree} disabled={!canProceed || submitting}>
              {submitting ? "Processing..." : "I Agree and Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
