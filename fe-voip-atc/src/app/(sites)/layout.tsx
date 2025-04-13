"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { VoIPProvider } from "@/context/voipContext";
import { CallProvider } from "@/context/callContext";
import IncomingCallUI from "@/components/IncomingCallUI";
import CallUI from "@/components/callUI";
import { useSip } from "@/lib/useSip"; // ✅ import hook
import "react-toastify/dist/ReactToastify.css";

interface LayoutProps {
  children: React.ReactNode;
}

// ⬇️ Komponen internal yang akan setup SIP jika sipConfig tersedia
function SipInitializer() {
  const [sipConfig, setSipConfig] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("sipConfig");
    if (stored) {
      try {
        setSipConfig(JSON.parse(stored));
      } catch (e) {
        console.error("Invalid SIP config in localStorage");
      }
    }
  }, []);

  useSip(sipConfig); // ✅ setup SIP connection

  return null; // Tidak render apa pun, hanya jalankan hook
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <CallProvider>
      <VoIPProvider>
        {/* ⬇️ Setup SIP Agent setelah masuk halaman dashboard */}
        <SipInitializer />

        <div className="flex h-screen">
          <Sidebar />

          {/* Wrapper bagian kanan */}
          <div className="relative flex-1 flex flex-col w-screen bg-[#2f3136] overflow-hidden">
            <IncomingCallUI />
            <main className="p-8 md:p-12 overflow-y-auto h-full">
              {children}
            </main>

            {/* CallUI ditaruh paling akhir agar render di atas */}
            <CallUI />
          </div>
        </div>
      </VoIPProvider>
    </CallProvider>
  );
};

export default DashboardLayout;
