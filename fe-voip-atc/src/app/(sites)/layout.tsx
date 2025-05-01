"use client";

import React, { useEffect, useState, Suspense } from "react";
import Sidebar from "@/components/sidebar";
import { VoIPProvider } from "@/context/voipContext";
import { CallProvider } from "@/context/callContext";
import IncomingCallUI from "@/components/IncomingCallUI";
import CallUI from "@/components/callUI";
import { useSip } from "@/lib/useSip";
import "react-toastify/dist/ReactToastify.css";
import FloatingCallUIWrapper from "@/components/CallUIWrapper";

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
          <Sidebar />
          <div className="relative flex-1 bg-[#2f3136]">
            <FloatingCallUIWrapper />
            <main className="p-8 md:p-12 overflow-y-auto h-full">
              {children}
            </main>
          </div>
        </div>
      </VoIPProvider>
    </CallProvider>
  );
};

export default DashboardLayout;
