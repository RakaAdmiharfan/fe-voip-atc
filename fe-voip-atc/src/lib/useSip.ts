import { useEffect } from "react";
import { UserAgent, Registerer } from "sip.js";
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
  const { receiveCall } = useCall();

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

    userAgent.delegate = {
      onInvite: async (invitation) => {
        console.log("📲 Incoming call received via SIP.js");
        receiveCall(invitation);
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
  }, [sipConfig, setUserAgent, receiveCall, onConnected]);
}
