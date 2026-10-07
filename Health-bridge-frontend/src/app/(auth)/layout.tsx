import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {children}
    </div>
  );
}
