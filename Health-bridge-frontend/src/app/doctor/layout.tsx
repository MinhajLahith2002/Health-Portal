import DoctorShell from "@/features/doctor/components/DoctorShell";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <DoctorShell>{children}</DoctorShell>;
}
