"use client";

import React from "react";
import { HospitalProvider } from "@/context/HospitalContext";

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HospitalProvider>{children}</HospitalProvider>;
}