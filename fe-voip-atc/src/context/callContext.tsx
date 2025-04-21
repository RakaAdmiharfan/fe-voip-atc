"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  Inviter,
  Invitation,
  SessionState,
  SessionDescriptionHandler,
} from "sip.js";

interface ExtendedSDH extends SessionDescriptionHandler {
  peerConnection: RTCPeerConnection;
}

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

  const setupAudioElement = (stream: MediaStream) => {
    const audio = document.createElement("audio");
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.setAttribute("playsinline", "true");
    audio.volume = 1;
    audio.style.display = "none";
    document.body.appendChild(audio);
  };

  const endCall = useCallback(() => {
    if (!currentSession) {
      setCallState("idle");
      return;
    }

    const handleTermination = () => {
      console.log("[📴 Call Terminated]");
      setCurrentSession(null);
      setIncomingSession(null);
      setCallState("idle");
      setParticipants([]);
    };

    try {
      if (currentSession instanceof Inviter) {
        currentSession.cancel();
      } else if (currentSession instanceof Invitation) {
        currentSession.bye();
      } else {
        handleTermination();
      }
    } catch (error) {
      console.error("Error during call termination:", error);
      handleTermination();
    }
  }, [currentSession]);

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
  }, [incomingSession, endCall]);

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

  // 🔊 Attach remote stream to <audio>
  useEffect(() => {
    if (!currentSession) return;

    const sessionDescriptionHandler = currentSession.sessionDescriptionHandler;
    if (!sessionDescriptionHandler) return;

    const handleRemoteStream = () => {
      const pc = (sessionDescriptionHandler as ExtendedSDH).peerConnection;
      if (!pc) return;

      pc.oniceconnectionstatechange = () => {
        console.log("[ICE STATE]", pc.iceConnectionState);
      };
      
      const remoteStream = new MediaStream();
      pc.getReceivers().forEach((receiver) => {
        if (receiver.track?.kind === "audio") {
          remoteStream.addTrack(receiver.track);
        }
      });

      setupAudioElement(remoteStream);
    };

    const timer = setTimeout(() => {
      try {
        handleRemoteStream();
      } catch (e) {
        console.error("⚠️ Failed to handle remote audio stream:", e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentSession]);

  // 📲 Auto decline after timeout
  useEffect(() => {
    if (callState === "ringing") {
      const timeout = setTimeout(() => {
        console.log("⏱️ Auto-declining incoming call");
        declineCall();
      }, 30_000);
      return () => clearTimeout(timeout);
    }
  }, [callState, declineCall]);

  useEffect(() => {
    if (callState === "calling") {
      const timeout = setTimeout(() => {
        console.log("⏱️ Auto-ending unanswered outgoing call");
        endCall(); // timeout untuk caller
      }, 30_000);

      return () => clearTimeout(timeout);
    }
  }, [callState, endCall]);

  // 📞 Debugging
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
    if (!currentSession) return;

    const onStateChange = (newState: SessionState) => {
      if (newState === SessionState.Terminated) {
        console.log("[📴 Session terminated detected]");
        endCall(); // sinkronisasi end call
      }
    };

    currentSession.stateChange.addListener(onStateChange);
    return () => currentSession.stateChange.removeListener(onStateChange);
  }, [currentSession, endCall]);

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
