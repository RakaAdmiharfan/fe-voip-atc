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
    const uri = UserAgent.makeURI("sip:1001@108.136.168.80");
    if (!uri) {
      console.error("❌ Invalid SIP URI!");
      return;
    }

    const userAgent = new UserAgent({
      uri: UserAgent.makeURI("sip:1001@108.136.168.80"),
      transportOptions: {
        wsServers: "ws://108.136.168.80:8089/ws", // Coba tanpa TLS dulu
      },
      authorizationUsername: "webrtc_user",
      authorizationPassword: "your_password",
      sessionDescriptionHandlerFactoryOptions: {
        constraints: { audio: true, video: false },
        peerConnectionOptions: {
          rtcConfiguration: {
            iceServers: [], // STUN di-disable sementara
          },
        },
      },
      delegate: {
        onDisconnect: (error) => {
          console.error("🚨 Disconnected from Asterisk:", error);
        },
        onConnect: () => {
          console.log("✅ Connected to Asterisk via WebSocket!");
        },
      },
    });

    userAgent
      .start()
      .then(() => console.log("✅ SIP.js successfully registered!"))
      .catch((error) => console.error("❌ Failed to register SIP:", error));

    userAgent
      .start()
      .then(() => {
        console.log("✅ SIP.js successfully registered!");
        setSipUserAgent(userAgent);
        onAgentReady(userAgent);
      })
      .catch((error) => {
        console.error("❌ Failed to register SIP:", error);
      });

    return () => {
      (async () => {
        if (userAgent) {
          await userAgent.stop();
          console.log("🛑 SIP.js disconnected!");
        }
      })();
    };
  }, []);

  return null; // Tidak perlu render UI
}
