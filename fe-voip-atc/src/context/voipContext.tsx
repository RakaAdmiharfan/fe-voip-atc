// context/voipContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAgent, Invitation } from "sip.js";
import { useCall } from "@/context/callContext";

interface VoIPContextType {
  userAgent: UserAgent | null;
  setUserAgent: (ua: UserAgent | null) => void;
}

const VoIPContext = createContext<VoIPContextType | undefined>(undefined);

export const VoIPProvider = ({ children }: { children: React.ReactNode }) => {
  const [userAgent, setUserAgent] = useState<UserAgent | null>(null);
  const { receiveCall } = useCall();

  useEffect(() => {
    if (!userAgent) return;

    userAgent.delegate = {
      onInvite: (invitation: Invitation) => {
        receiveCall(invitation);
      },
    };
  }, [userAgent, receiveCall]);

  return (
    <VoIPContext.Provider value={{ userAgent, setUserAgent }}>
      {children}
    </VoIPContext.Provider>
  );
};

export const useVoIP = () => {
  const context = useContext(VoIPContext);
  if (!context) {
    throw new Error("useVoIP must be used within a VoIPProvider");
  }
  return context;
};
