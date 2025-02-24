"use client";

import { createContext, useContext, useState } from "react";
import { Inviter, Session, UserAgent } from "sip.js";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isSpeaking: boolean;
}

interface CallContextType {
  startCall: (username: string, targetUri: string) => void;
  addParticipant: (username: string) => void;
  isInCall: boolean;
  caller: string;
  callState: "idle" | "ringing" | "connected";
  participants: Participant[];
  setCallState: (state: "idle" | "ringing" | "connected") => void;
  endCall: () => void;
  callSession: Session | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [isInCall, setIsInCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected">(
    "idle"
  );
  const [callSession, setCallSession] = useState<Session | null>(null);
  const [userAgent, setUserAgent] = useState<UserAgent | null>(null);

  // Fungsi untuk memulai panggilan
  const startCall = async (username: string, targetUri: string) => {
    if (!userAgent) {
      console.error("UserAgent SIP belum dikonfigurasi.");
      return;
    }

    setCaller(username);
    setCallState("ringing");
    setIsInCall(true);

    // Buat Inviter (memulai panggilan)
    const uri = UserAgent.makeURI(targetUri);
    if (!uri) {
      console.error("URI target tidak valid.");
      return;
    }

    const inviter = new Inviter(userAgent, uri);

    try {
      const outgoingRequest = await inviter.invite(); // Kirim SIP INVITE

      // Tangani event session (menggunakan delegate)
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
          name: username,
          avatar: `https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png`,
          isSpeaking: false,
        },
      ]);

      setCallSession(inviter); // Simpan session
    } catch (error) {
      console.error("Gagal memulai panggilan:", error);
      setIsInCall(false);
      setCallState("idle");
    }
  };

  // Fungsi untuk menambahkan peserta baru
  const addParticipant = (username: string) => {
    setParticipants((prev) => {
      if (prev.some((p) => p.name === username)) return prev;

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: username,
          avatar: `https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png?img=${
            prev.length + 1
          }`,
          isSpeaking: false,
        },
      ];
    });

    // Anggap panggilan dimulai jika ada peserta lain masuk
    setCallState("connected");
  };

  // Fungsi untuk mengakhiri panggilan
  const endCall = () => {
    if (callSession) {
      callSession.bye(); // Kirim SIP BYE
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
        addParticipant,
        isInCall,
        caller,
        participants,
        callState,
        setCallState,
        endCall,
        callSession,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall must be used within a CallProvider");
  return context;
}
