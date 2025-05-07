"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  callState: "idle" | "calling" | "ringing" | "in-call" | "ended";
  setCallState: (state: CallContextType["callState"]) => void;
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  startCall: (inviter: Inviter, targetId: string) => void;
  receiveCall: (invitation: Invitation) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  leaveChannel: () => void;
  isChannel: boolean;
  setIsChannel: (flag: boolean) => void;
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
    "idle" | "calling" | "ringing" | "in-call" | "ended"
  >("idle");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isChannel, setIsChannel] = useState(false);
  const outgoingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupAudioElements = () => {
    document.querySelectorAll("audio").forEach((audio) => audio.remove());
  };

  const hardResetCallState = useCallback(() => {
    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
    outgoingTimeoutRef.current = null;
    setCurrentSession(null);
    setIncomingSession(null);
    setParticipants([]);
    setIsChannel(false);
    setCallState("idle");
    cleanupAudioElements();
  }, []);

  const endCall = useCallback(() => {
    if (!currentSession) {
      setCallState("ended");
      setTimeout(hardResetCallState, 1000);
      return;
    }
    try {
      if (
        currentSession.state === SessionState.Initial ||
        currentSession.state === SessionState.Establishing
      ) {
        if (currentSession instanceof Inviter) {
          currentSession.cancel();
        }
      } else if (currentSession.state === SessionState.Established) {
        currentSession.bye();
      }
    } catch (err) {
      console.error("Error ending call:", err);
    } finally {
      setCallState("ended");
      setTimeout(hardResetCallState, 1000);
    }
  }, [currentSession, hardResetCallState]);

  const rejectCall = useCallback(() => {
    if (!incomingSession) return;
    try {
      incomingSession.reject();
    } catch (error) {
      console.error("Failed to reject incoming call:", error);
    }
    setCallState("ended");
    setTimeout(hardResetCallState, 1000);
  }, [incomingSession, hardResetCallState]);

  const leaveChannel = useCallback(() => {
    endCall();
  }, [endCall]);

  const startCall = useCallback(
    async (inviter: Inviter, targetId: string) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const pc = (inviter.sessionDescriptionHandler as any)
          ?.peerConnection as RTCPeerConnection;

        stream.getTracks().forEach((track) => {
          pc?.addTrack(track, stream);
        });

        const self: Participant = {
          id: "self",
          username: "You",
          avatar: "user.png",
        };
        const target: Participant = {
          id: targetId,
          username: targetId,
          avatar: "user.png",
        };
        setParticipants([self, target]);

        setCallState("calling");
        setCurrentSession(inviter);
      } catch (err) {
        console.error("startCall failed:", err);
        hardResetCallState();
      }
    },
    [hardResetCallState]
  );

  const receiveCall = useCallback((invitation: Invitation) => {
    setIncomingSession(invitation);
    setCallState("ringing");

    const self: Participant = {
      id: "self",
      username: "You",
      avatar: "user.png",
    };
    const caller = invitation.remoteIdentity.uri.user || "unknown";
    const from: Participant = {
      id: caller,
      username: caller,
      avatar: "user.png",
    };
    setParticipants([from, self]);
  }, []);

  const acceptCall = useCallback(async () => {
    if (!incomingSession) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await incomingSession.accept();

      const pc = (incomingSession.sessionDescriptionHandler as any)
        ?.peerConnection as RTCPeerConnection;
      stream.getTracks().forEach((track) => {
        pc?.addTrack(track, stream);
      });

      setCurrentSession(incomingSession);
      setIncomingSession(null);
      setCallState("in-call");

      const self: Participant = {
        id: "self",
        username: "You",
        avatar: "user.png",
      };
      const caller = incomingSession.remoteIdentity.uri.user || "unknown";
      const from: Participant = {
        id: caller,
        username: caller,
        avatar: "user.png",
      };
      setParticipants([from, self]);
    } catch (error) {
      console.error("Failed to accept call:", error);
      hardResetCallState();
    }
  }, [incomingSession, hardResetCallState]);

  useEffect(() => {
    if (!currentSession) return;

    const sessionDescriptionHandler =
      currentSession.sessionDescriptionHandler as ExtendedSDH;
    if (!sessionDescriptionHandler?.peerConnection) return;

    const remoteStream = new MediaStream();
    sessionDescriptionHandler.peerConnection
      .getReceivers()
      .forEach((receiver) => {
        if (receiver.track?.kind === "audio") {
          remoteStream.addTrack(receiver.track);
        }
      });

    const audio = document.createElement("audio");
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.setAttribute("playsinline", "true");
    audio.style.display = "none";
    audio.volume = 1;
    document.body.appendChild(audio);
  }, [currentSession]);

  useEffect(() => {
    if (callState === "calling") {
      const timeout = setTimeout(() => {
        console.log("⏱️ Auto-ending unanswered outgoing call");
        endCall();
      }, 60000);
      outgoingTimeoutRef.current = timeout;
      return () => clearTimeout(timeout);
    }
  }, [callState, endCall]);

  useEffect(() => {
    if (!incomingSession) return;

    const onIncomingStateChange = (newState: SessionState) => {
      console.log("[📞 Incoming Session State]", newState);
      if (newState === SessionState.Terminated) {
        setCallState("ended");
        setTimeout(hardResetCallState, 1000);
      }
    };

    incomingSession.stateChange.addListener(onIncomingStateChange);
    return () =>
      incomingSession.stateChange.removeListener(onIncomingStateChange);
  }, [incomingSession, hardResetCallState]);

  useEffect(() => {
    if (!currentSession) return;

    const onStateChange = (newState: SessionState) => {
      console.log("[📞 Session State]", newState);

      if (newState === SessionState.Established) {
        if (outgoingTimeoutRef.current) {
          clearTimeout(outgoingTimeoutRef.current);
          outgoingTimeoutRef.current = null;
        }
      } else if (newState === SessionState.Terminated) {
        console.log("[📴 Session Terminated]");
        setCallState("ended");
        setTimeout(hardResetCallState, 1000);
      }
    };

    currentSession.stateChange.addListener(onStateChange);
    return () => currentSession.stateChange.removeListener(onStateChange);
  }, [currentSession, hardResetCallState]);

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
        rejectCall,
        endCall,
        leaveChannel,
        isChannel,
        setIsChannel,
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
