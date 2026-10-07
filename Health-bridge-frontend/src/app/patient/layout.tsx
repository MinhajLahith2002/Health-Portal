"use client";

import DashboardLayout from "@/app/dashboard/layout";
import { usePathname } from "next/navigation";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dynamically determine the title based on the URL
  let title = "Patient Workspace";
  if (pathname.includes("/dashboard")) title = "Patient Dashboard";
  else if (pathname.includes("/family")) title = "Family Members";
  else if (pathname.includes("/health-metrics")) title = "Health Metrics";
  else if (pathname.includes("/lab-reports")) title = "My Lab Reports";
  else if (pathname.includes("/medications")) title = "Prescriptions & Medications";
  else if (pathname.includes("/reminders")) title = "Medication Reminders";
  else if (pathname.includes("/sos")) title = "Emergency SOS";
  else if (pathname.includes("/insurance/submit-claim")) title = "Submit New Claim";
  else if (pathname.includes("/insurance")) title = "My Insurance";

  return (
    <DashboardLayout pageTitle={title}>
      {children}
    </DashboardLayout>
  );
}
