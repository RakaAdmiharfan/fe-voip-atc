"use client";

import { createContext, useContext, useState } from "react";
import { Inviter, Session, UserAgent } from "sip.js";

interface Participant {
  id: string;
  username: string;
  avatar: string;
  isSpeaking: boolean;
}

interface CallContextType {
  startCall: (username: string, targetUri: string) => void;
  isInCall: boolean;
  caller: string;
  callState: "idle" | "ringing" | "connected";
  participants: Participant[];
  setCallState: (state: "idle" | "ringing" | "connected") => void;
  endCall: () => void;
  callSession: Session | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider(userAgent : UserAgent ) {
  const [isInCall, setIsInCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected">(
    "idle"
  );
  const [callSession, setCallSession] = useState<Session | null>(null);

  // Pastikan `userAgent` tidak null saat start call
  const startCall = async (username: string, targetUri: string) => {
    if (!userAgent) {
      console.error("UserAgent SIP belum dikonfigurasi.");
      return;
    }

    setCaller(username);
    setCallState("ringing");
    setIsInCall(true);

    const uri = UserAgent.makeURI(targetUri);
    if (!uri) {
      console.error("URI target tidak valid.");
      return;
    }

    const inviter = new Inviter(userAgent, uri);
    try {
      await inviter.invite();

      inviter.delegate = {
        onInvite: () => console.log("Ringing..."),
        onAck: () => {
          console.log("Panggilan diterima!");
          setCallState("connected");
        },
        onBye: () => {
          console.log("Panggilan berakhir.");
          endCall();
        },
      };

      setParticipants([
        {
          id: crypto.randomUUID(),
          username: username,
          avatar: `https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png`,
          isSpeaking: false,
        },
      ]);

      setCallSession(inviter);
    } catch (error) {
      console.error("Gagal memulai panggilan:", error);
      setIsInCall(false);
      setCallState("idle");
    }
  };

  const endCall = () => {
    if (callSession && callSession.state === "Established") {
      callSession.bye();
    }

    setIsInCall(false);
    setCaller("");
    setParticipants([]);
    setCallState("idle");
    setCallSession(null);
  };

  return (
    <CallContext.Provider
      value={{
        startCall,
        isInCall,
        caller,
        callState,
        participants,
        setCallState,
        endCall,
        callSession,
      }}
    ></CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within a CallProvider");
  return context;
}
