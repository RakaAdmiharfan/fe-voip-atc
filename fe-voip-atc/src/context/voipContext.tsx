"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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

  const setupDelegate = useCallback(
    (ua: UserAgent) => {
      ua.delegate = {
        onInvite: (invitation: Invitation) => {
          console.log("📥 Incoming call received.");
          receiveCall(invitation);
        },
      };
    },
    [receiveCall]
  );

  useEffect(() => {
    if (!userAgent) return;

    setupDelegate(userAgent);

    return () => {
      // Cleanup: Hapus delegate waktu userAgent berubah
      if (userAgent) {
        userAgent.delegate = {};
      }
    };
  }, [userAgent, setupDelegate]);

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
