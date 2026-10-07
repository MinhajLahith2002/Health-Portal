import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/appointments",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { fullName: "Jane Doe", role: "PATIENT" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/services/appointmentService", () => ({
  appointmentService: {
    getAppointments: vi.fn().mockResolvedValue([]),
    cancelAppointment: vi.fn(),
  },
}));

import AppointmentsPage from "@/app/appointments/page";

describe("appointments overview page", () => {
  it("hides the duplicate appointment navigation row while keeping the status tabs and the Find a Doctor CTA", async () => {
    const html = renderToStaticMarkup(<AppointmentsPage />);

    expect(html).toContain("My Appointments");
    expect(html).toContain("+ Find a Doctor");
    expect(html).toContain("Upcoming");
    expect(html).toContain("Completed");
    expect(html).toContain("Cancelled");
    expect(html).not.toContain("Book New Appointment");
    expect(html).not.toContain("Book Appointment");
  });
});
