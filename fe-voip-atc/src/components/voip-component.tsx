"use client";
import { useEffect, useState } from "react";
import { UserAgent } from "sip.js";

export default function VoIPComponent({
  onAgentReady,
}: {
  onAgentReady: (agent: UserAgent) => void;
}) {
  const [sipUserAgent, setSipUserAgent] = useState<UserAgent | null>(null);

  useEffect(() => {
    const uri = UserAgent.makeURI("sip:1001@your_asterisk_server");
    if (!uri) {
      console.error("❌ Invalid SIP URI!");
      return;
    }

    const userAgent = new UserAgent({
      uri,
      transportOptions: {
        wsServers: "wss://your_asterisk_server:8089/ws",
      },
      authorizationUsername: "1001",
      authorizationPassword: "password123",
      sessionDescriptionHandlerFactoryOptions: {
        constraints: { audio: true, video: false },
      },
    });

    userAgent.start().then(() => {
      console.log("✅ SIP.js connected to Asterisk!");
      setSipUserAgent(userAgent);
      onAgentReady(userAgent);
    });

    return () => {
      (async () => {
        await userAgent.stop();
      })();
    };
  }, []);

  return null; // Tidak perlu render UI
}
