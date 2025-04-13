// lib/useSip.ts
import { useEffect } from "react";
import { UserAgent, Registerer } from "sip.js";
import { useVoIP } from "@/context/voipContext";

interface SipConfig {
  username: string;
  password: string;
  domain: string;
  wss: string;
}

export function useSip(sipConfig: SipConfig | null, onConnected?: () => void) {
  const { setUserAgent } = useVoIP();

  useEffect(() => {
    if (!sipConfig) return;

    const userAgent = new UserAgent({
      uri: UserAgent.makeURI(`sip:${sipConfig.username}@${sipConfig.domain}`)!,
      transportOptions: { server: sipConfig.wss },
      authorizationUsername: sipConfig.username,
      authorizationPassword: sipConfig.password,
    });

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
