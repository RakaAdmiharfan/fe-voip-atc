// src/app/(sites)/layout.tsx
"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect } from "react";

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Kirim heartbeat langsung sekali saat awal
    fetch("/api/heartbeat", { method: "POST" });

    // Lanjut heartbeat interval
    const interval = setInterval(() => {
      fetch("/api/heartbeat", { method: "POST" });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return <DashboardLayout>{children}</DashboardLayout>;
}
