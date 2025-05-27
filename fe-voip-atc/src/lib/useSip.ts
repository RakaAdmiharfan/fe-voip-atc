import { useEffect, useRef } from "react";
import { UserAgent, Registerer } from "sip.js";
import { useVoIP } from "@/context/voipContext";
import { useCall } from "@/context/callContext";
import { toast } from "react-toastify";

interface SipConfig {
  username: string;
  password: string;
  domain: string;
  wss: string;
}

export function useSip(sipConfig: SipConfig | null, onConnected?: () => void) {
  const { setUserAgent } = useVoIP();
  const { receiveCall } = useCall();
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sipConfig) return;

    const userAgent = new UserAgent({
      uri: UserAgent.makeURI(`sip:${sipConfig.username}@${sipConfig.domain}`)!,
      transportOptions: {
        server: sipConfig.wss,
      },
      authorizationUsername: sipConfig.username,
      authorizationPassword: sipConfig.password,
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          iceTransportPolicy: "all",
        },
      },
    });

    const registerer = new Registerer(userAgent);

    // --- DELEGATE EVENT HANDLERS (works on SIP.js 0.20+) ---
    userAgent.delegate = {
      onInvite: async (invitation) => {
        console.log("📲 Incoming call received via SIP.js");
        receiveCall(invitation);
      },
      onConnect: () => {
        console.log("✅ SIP WebSocket Connected");
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
      },
      onDisconnect: (error?: Error) => {
        console.error("❌ SIP WebSocket Disconnected", error);
        toast.error("SIP koneksi terputus. Reloading...");
        reconnectRef.current = setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
    };

    const connect = async () => {
      try {
        await userAgent.start();
        await registerer.register();
        setUserAgent(userAgent);
        console.log("✅ SIP connected and registered");
        if (onConnected) onConnected();
      } catch (error) {
        console.error("❌ SIP connection error", error);
        toast.error("Gagal konek ke server SIP. Coba refresh.");
      }
    };

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      registerer.unregister().catch(() => {});
      userAgent.stop().catch(() => {});
      setUserAgent(null);
      console.log("🛑 SIP disconnected");
    };
  }, [sipConfig, setUserAgent, receiveCall, onConnected]);
}
