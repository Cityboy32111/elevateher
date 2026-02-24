import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useConsent() {
  const checkConsent = useCallback(async (
    userId: string,
    consentType: string
  ): Promise<boolean> => {
    const { data, error } = await supabase
      .from("consent_records")
      .select("id")
      .eq("user_id", userId)
      .eq("consent_type", consentType)
      .maybeSingle();

    if (error) {
      console.error("Error checking consent:", error);
      return false;
    }
    return !!data;
  }, []);

  const recordConsent = useCallback(async (
    consentType: string,
    consentText: string
  ): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("consent_records")
      .insert({
        user_id: user.id,
        consent_type: consentType,
        consent_version: "1.0",
        consent_text: consentText,
        user_agent: navigator.userAgent,
      });

    if (error) throw error;
  }, []);

  return { checkConsent, recordConsent };
}
