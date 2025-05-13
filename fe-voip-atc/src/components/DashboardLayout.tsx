// src/app/(sites)/DashboardLayout.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { VoIPProvider } from "@/context/voipContext";
import { CallProvider } from "@/context/callContext";
import CallUI from "@/components/callUI";
import { useSip } from "@/lib/useSip";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LayoutProps {
  children: React.ReactNode;
}

function SipInitializer() {
  const [sipConfig, setSipConfig] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("sipConfig");
    if (stored) {
      try {
        setSipConfig(JSON.parse(stored));
      } catch (e) {
        console.error("Invalid SIP config in localStorage", e);
      }
    }
  }, []);

  useSip(sipConfig);
  return null;
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <CallProvider>
      <VoIPProvider>
        <SipInitializer />
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex h-screen">
          <Suspense
            fallback={<div className="text-white p-4">Loading Sidebar...</div>}
          >
            <Sidebar />
          </Suspense>

          <div className="relative flex-1 bg-[#2f3136]">
            <CallUI />
            <main className="ml-12 lg:ml-0 p-8 md:p-12 overflow-y-auto h-full">
              {children}
            </main>
          </div>
        </div>
      </VoIPProvider>
    </CallProvider>
  );
};

export default DashboardLayout;
