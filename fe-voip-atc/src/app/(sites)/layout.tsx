"use client";

import React, { useEffect, useState, Suspense } from "react";
import Sidebar from "@/components/sidebar";
import { VoIPProvider } from "@/context/voipContext";
import { CallProvider } from "@/context/callContext";
import IncomingCallUI from "@/components/IncomingCallUI";
import CallUI from "@/components/callUI";
import { useSip } from "@/lib/useSip";
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

        <div className="flex h-screen">
          <Suspense
            fallback={<div className="text-white p-4">Loading sidebar...</div>}
          >
            <Sidebar />
          </Suspense>

          <div className="relative flex-1 flex flex-col w-screen bg-[#2f3136] overflow-hidden">
            <IncomingCallUI />
            <main className="p-8 md:p-12 overflow-y-auto h-full">
              {children}
            </main>
            <CallUI />
          </div>
        </div>
      </VoIPProvider>
    </CallProvider>
  );
};

export default DashboardLayout;
