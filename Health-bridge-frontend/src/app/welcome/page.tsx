"use client";

import { useRouter } from "next/navigation";
import { WelcomePage } from "@/components/ui/WelcomePage";

export default function WelcomeRoute() {
  const router = useRouter();

  return (
    <WelcomePage
      onBookAppointment={() => router.push("/appointments/search-doctor")}
      onContinueGuest={() => router.push("/login")}
    />
  );
}
