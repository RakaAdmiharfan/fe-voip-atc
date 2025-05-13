// src/app/(sites)/layout.tsx
import DashboardLayout from "@/components/DashboardLayout";

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
