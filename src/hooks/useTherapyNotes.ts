import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TherapyNote } from "@/integrations/supabase/types";

export function useTherapyNotes() {
  const [loading, setLoading] = useState(false);

  const fetchNoteBySessionId = useCallback(async (sessionId: string): Promise<TherapyNote | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("therapy_notes")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching therapy note:", error);
        return null;
      }
      return data as TherapyNote | null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (
    sessionId: string,
    clientId: string,
    noteType: string,
    content: string
  ): Promise<TherapyNote | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("therapy_notes")
        .insert({
          session_id: sessionId,
          therapist_id: user.id,
          client_id: clientId,
          note_type: noteType,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating therapy note:", error);
        return null;
      }
      return data as TherapyNote;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNote = useCallback(async (
    noteId: string,
    content: string
  ): Promise<TherapyNote | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("therapy_notes")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", noteId)
        .select()
        .single();

      if (error) {
        console.error("Error updating therapy note:", error);
        return null;
      }
      return data as TherapyNote;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchNoteBySessionId, createNote, updateNote, loading };
}
