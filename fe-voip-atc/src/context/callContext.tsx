"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Inviter, Invitation, SessionState } from "sip.js";

interface Participant {
  id: string;
  username: string;
  avatar?: string;
}

interface CallContextType {
  currentSession: Inviter | Invitation | null;
  setCurrentSession: (session: Inviter | Invitation | null) => void;
  callState: "idle" | "calling" | "ringing" | "in-call";
  setCallState: (state: CallContextType["callState"]) => void;
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  startCall: (username: string) => void;
  receiveCall: (invitation: Invitation) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  incomingSession: Invitation | null;
  setIncomingSession: (session: Invitation | null) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<
    Inviter | Invitation | null
  >(null);
  const [incomingSession, setIncomingSession] = useState<Invitation | null>(
    null
  );
  const [callState, setCallState] = useState<
    "idle" | "calling" | "ringing" | "in-call"
  >("idle");
  const [participants, setParticipants] = useState<Participant[]>([]);

  const startCall = useCallback((username: string) => {
    const self: Participant = {
      id: "self",
      username: "You",
      avatar: "/avatar/self.png",
    };

    const target: Participant = {
      id: username,
      username,
      avatar: "/avatar/user.png",
    };

    setParticipants([self, target]);
    setCallState("calling");
  }, []);

  const receiveCall = useCallback((invitation: Invitation) => {
    setIncomingSession(invitation);
    setCallState("ringing");

    const self: Participant = {
      id: "self",
      username: "You",
      avatar: "/avatar/self.png",
    };

    const caller = invitation.remoteIdentity.uri.user || "unknown";

    const from: Participant = {
      id: caller,
      username: caller,
      avatar: "/avatar/user.png",
    };

    setParticipants([from, self]);
  }, []);

  const acceptCall = useCallback(async () => {
    if (!incomingSession) return;

    try {
      await incomingSession.accept();
      setCurrentSession(incomingSession);
      setIncomingSession(null);
      setCallState("in-call");
    } catch (error) {
      console.error("Failed to accept call:", error);
      endCall();
    }
  }, [incomingSession]);

  const declineCall = useCallback(() => {
    if (!incomingSession) return;

    try {
      incomingSession.reject();
    } catch (error) {
      console.error("Failed to decline call:", error);
    }

    setIncomingSession(null);
    setCallState("idle");
    setParticipants([]);
  }, [incomingSession]);

  const endCall = useCallback(() => {
    if (!currentSession) {
      setCallState("idle");
      return;
    }

    const handleTermination = () => {
      console.log("[📴 Call Terminated by endCall()]");
      setCurrentSession(null);
      setIncomingSession(null);
      setCallState("idle");
      setParticipants([]);
    };

    try {
      currentSession.stateChange.addListener((newState) => {
        if (newState === SessionState.Terminated) {
          handleTermination();
        }
      });

      if (currentSession instanceof Inviter) {
        currentSession.cancel();
      } else if (currentSession instanceof Invitation) {
        currentSession.bye();
      } else {
        handleTermination(); // fallback
      }
    } catch (error) {
      console.error("Failed to end call:", error);
      handleTermination();
    }
  }, [currentSession]);

  // 🔍 Debugging
  useEffect(() => {
    console.log("[📞 Call State]", callState);
  }, [callState]);

  useEffect(() => {
    if (incomingSession) {
      console.log(
        "[📲 Incoming Call from]",
        incomingSession.remoteIdentity.uri.toString()
      );
    }
  }, [incomingSession]);

  useEffect(() => {
    if (currentSession) {
      const onStateChange = () => {
        if (currentSession.state === SessionState.Terminated) {
          console.log("[📴 Call Terminated Automatically]");
          setCallState("idle");
          setCurrentSession(null);
          setParticipants([]);
        }
      };
      currentSession.stateChange.addListener(onStateChange);
      return () => {
        currentSession.stateChange.removeListener(onStateChange);
      };
    }
  }, [currentSession]);

  // ⏱️ Auto-decline call after 30 seconds if not answered
  useEffect(() => {
    if (callState === "ringing") {
      const timeout = setTimeout(() => {
        console.log("[⏱️ Timeout] Auto-decline incoming call");
        declineCall();
      }, 30_000);
      return () => clearTimeout(timeout);
    }
  }, [callState, declineCall]);

  return (
    <CallContext.Provider
      value={{
        currentSession,
        setCurrentSession,
        incomingSession,
        setIncomingSession,
        callState,
        setCallState,
        participants,
        setParticipants,
        startCall,
        receiveCall,
        acceptCall,
        declineCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
