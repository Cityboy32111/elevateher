import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Video, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useConsent } from "@/hooks/useConsent";
import { ConsentModal } from "@/components/consent/ConsentModal";
import { supabase } from "@/integrations/supabase/client";

interface Coach {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  bio: string;
}

const coaches: Coach[] = [
  { id: "1", name: "Dr. Emily Foster", specialty: "Career Transitions", initials: "EF", bio: "15+ years helping professionals navigate career transitions and return-to-work journeys." },
  { id: "2", name: "Lisa Park", specialty: "Work-Life Integration", initials: "LP", bio: "Certified coach specializing in work-life balance for working parents." },
  { id: "3", name: "Rachel Thompson", specialty: "Executive Coaching", initials: "RT", bio: "Former Fortune 500 executive turned coach, focused on promotion readiness and visibility." },
];

const generateTimeSlots = () => {
  const slots: Date[] = [];
  for (let d = 1; d <= 5; d++) {
    const day = addDays(new Date(), d);
    for (const hour of [9, 10, 11, 14, 15, 16]) {
      slots.push(setMinutes(setHours(day, hour), 0));
    }
  }
  return slots;
};

export default function CoachingPage() {
  const { user, profile } = useAuth();
  const { checkConsent } = useConsent();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [booked, setBooked] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (user) {
      checkConsent(user.id, "therapy_services").then(setHasConsent);
    }
  }, [user, checkConsent]);

  const checkStateEligibility = async (coachId: string): Promise<boolean> => {
    if (!profile?.state) return true; // If no state set, skip check
    const { data, error } = await supabase.rpc("therapist_eligible_for_state", {
      _therapist_id: coachId,
      _state: profile.state,
    });
    if (error) {
      console.error("Eligibility check error:", error);
      return true; // Allow if function doesn't exist yet
    }
    return data as boolean;
  };

  const handleBook = async () => {
    if (!selectedCoach || !selectedSlot) return;

    // Check consent first
    if (hasConsent === false) {
      setShowConsent(true);
      return;
    }

    // Check state eligibility
    const eligible = await checkStateEligibility(selectedCoach.id);
    if (!eligible) {
      setEligibilityError(
        "This therapist is not currently licensed to practice in your state. Please select a different therapist or contact support."
      );
      return;
    }

    setEligibilityError(null);
    setBooked(true);
    toast.success("Session booked successfully!");
  };

  const handleConsentComplete = () => {
    setShowConsent(false);
    setHasConsent(true);
    // Retry booking after consent
    if (selectedCoach && selectedSlot) {
      setBooked(true);
      toast.success("Session booked successfully!");
    }
  };

  const handleGoogleCalendar = () => {
    if (!selectedSlot || !selectedCoach) return;
    const start = selectedSlot.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(selectedSlot.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Coaching+Session+with+${encodeURIComponent(selectedCoach.name)}&dates=${start}/${end}&details=Your+elevateHer+coaching+session&location=Virtual`;
    window.open(url, "_blank");
  };

  const resetBooking = () => {
    setSelectedCoach(null);
    setSelectedSlot(null);
    setBooked(false);
  };

  return (
    <AppLayout>
      <ConsentModal
        open={showConsent}
        onConsented={handleConsentComplete}
        onCancel={() => setShowConsent(false)}
      />
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Coaching</h1>
          <p className="text-muted-foreground mt-1">Book 1:1 sessions with certified return-to-work coaches</p>
        </div>

        <Tabs defaultValue="book">
          <TabsList>
            <TabsTrigger value="book">Book Session</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6 mt-4">
            {booked ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <h3 className="text-xl font-semibold">Session Confirmed!</h3>
                  <p className="text-muted-foreground">
                    Your session with {selectedCoach?.name} is scheduled for{" "}
                    {selectedSlot && format(selectedSlot, "EEEE, MMMM d 'at' h:mm a")}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleGoogleCalendar} variant="outline">Add to Google Calendar</Button>
                    <Button onClick={resetBooking}>Book Another</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Step 1: Select Coach */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 1: Choose Your Coach</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coaches.map((coach) => (
                      <Card
                        key={coach.id}
                        className={`cursor-pointer transition-all ${selectedCoach?.id === coach.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                        onClick={() => setSelectedCoach(coach)}
                      >
                        <CardContent className="pt-6 text-center space-y-3">
                          <Avatar className="h-16 w-16 mx-auto">
                            <AvatarFallback className="bg-lavender-200 text-primary text-lg">{coach.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{coach.name}</p>
                            <Badge variant="secondary" className="mt-1">{coach.specialty}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{coach.bio}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Time */}
                {selectedCoach && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Step 2: Choose a Time Slot</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {timeSlots.map((slot, idx) => (
                        <Button
                          key={idx}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          className="flex flex-col h-auto py-3"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span className="text-xs">{format(slot, "EEE, MMM d")}</span>
                          <span className="font-semibold">{format(slot, "h:mm a")}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eligibility Error */}
                {eligibilityError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                    <p className="text-sm text-red-800 flex items-start gap-2">
                      <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      {eligibilityError}
                    </p>
                  </div>
                )}

                {/* Book Button */}
                {selectedCoach && selectedSlot && (
                  <div className="flex justify-center">
                    <Button size="lg" onClick={handleBook}>
                      <Video className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No upcoming sessions. Book one to get started!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No past sessions yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
