// lib/useSip.ts
import { useEffect } from "react";
import {
  UserAgent,
  Registerer,
  SessionDescriptionHandlerOptions,
} from "sip.js";
import { useVoIP } from "@/context/voipContext";
import { useCall } from "@/context/callContext";

interface SipConfig {
  username: string;
  password: string;
  domain: string;
  wss: string;
}

export function useSip(sipConfig: SipConfig | null, onConnected?: () => void) {
  const { setUserAgent } = useVoIP();
  const { receiveCall, setIncomingSession } = useCall();

  useEffect(() => {
    if (!sipConfig) return;

    const userAgent = new UserAgent({
      uri: UserAgent.makeURI(`sip:${sipConfig.username}@${sipConfig.domain}`)!,
      transportOptions: {
        server: sipConfig.wss,
      },
      authorizationUsername: sipConfig.username,
      authorizationPassword: sipConfig.password,

      // 🛠️ Tambahkan bagian ini
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" }, // atau STUN public lain
          ],
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          iceTransportPolicy: "all",
        },
      },
    });

    // ✅ HANDLE INCOMING CALL
    userAgent.delegate = {
      onInvite: async (invitation) => {
        console.log("📲 Incoming call received via SIP.js");
        receiveCall(invitation); // → panggil fungsi dari context kamu
      },
    };

    const registerer = new Registerer(userAgent);

    const connect = async () => {
      try {
        await userAgent.start();
        await registerer.register();
        setUserAgent(userAgent);
        console.log("✅ SIP connected and registered");
        if (onConnected) onConnected();
      } catch (error) {
        console.error("❌ SIP connection error", error);
      }
    };

    connect();

    return () => {
      registerer.unregister().catch(() => {});
      userAgent.stop().catch(() => {});
      setUserAgent(null);
      console.log("🛑 SIP disconnected");
    };
  }, [sipConfig, setUserAgent]);
}
