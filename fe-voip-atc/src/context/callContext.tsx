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
  gainRef: React.MutableRefObject<GainNode | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
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

  const gainRef = useRef<GainNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputDeviceIdRef = useRef<string | null>(null);
  const outputDeviceIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.input_device_id)
          inputDeviceIdRef.current = data.input_device_id;
        if (data?.output_device_id)
          outputDeviceIdRef.current = data.output_device_id;
      })
      .catch((err) => {
        console.error("Failed to fetch device settings", err);
      });
  }, []);

  const cleanupAudioElements = () => {
    document.querySelectorAll("audio").forEach((audio) => audio.remove());
  };

  const closeAudioContextSafe = async () => {
    try {
      if (audioContextRef.current?.state !== "closed") {
        await audioContextRef.current?.close();
      }
    } catch (err) {
      console.warn("AudioContext already closed or failed to close");
    }
    audioContextRef.current = null;
    gainRef.current = null;
  };

  const hardResetCallState = useCallback(async () => {
    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
    outgoingTimeoutRef.current = null;
    setCurrentSession(null);
    setIncomingSession(null);
    setParticipants([]);
    setIsChannel(false);
    setCallState("idle");
    cleanupAudioElements();
    await closeAudioContextSafe(); // ✅ tunggu sampai benar-benar tertutup
  }, []);

  const endCall = useCallback(async () => {
    if (!currentSession) {
      setCallState("ended");
      setTimeout(() => {
        hardResetCallState(); // ✅ jangan pakai await di sini
      }, 1000);
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
      setTimeout(() => {
        hardResetCallState(); // ✅ tetap async di dalam
      }, 1000);
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
    setTimeout(() => {
      hardResetCallState();
    }, 1000);
  }, [incomingSession, hardResetCallState]);

  const leaveChannel = useCallback(() => {
    endCall();
  }, [endCall]);

  // const setupAudioStream = async () => {
  //   const rawStream = await navigator.mediaDevices.getUserMedia({
  //     audio: inputDeviceIdRef.current
  //       ? { deviceId: { exact: inputDeviceIdRef.current } }
  //       : true,
  //   });

  //   const audioCtx = new AudioContext();
  //   const source = audioCtx.createMediaStreamSource(rawStream);
  //   const gainNode = audioCtx.createGain();
  //   gainNode.gain.value = 0;
  //   source.connect(gainNode);

  //   const destination = audioCtx.createMediaStreamDestination(); // ✅
  //   gainNode.connect(destination);

  //   gainRef.current = gainNode;
  //   audioContextRef.current = audioCtx;

  //   return destination.stream; // ✅ use this instead of rawStream
  // };

  const setupAudioStream = async () => {
    const rawStream = await navigator.mediaDevices.getUserMedia({
      audio: inputDeviceIdRef.current
        ? { deviceId: { exact: inputDeviceIdRef.current } }
        : true,
    });

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(rawStream);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0; // ✅ Always start muted

    const destination = audioCtx.createMediaStreamDestination();
    source.connect(gainNode);
    gainNode.connect(destination); // ✅ Connect to destination

    gainRef.current = gainNode;
    audioContextRef.current = audioCtx;

    return destination.stream; // ✅ Return stream to use in addTrack
  };

  const startCall = useCallback(
    async (inviter: Inviter, targetId: string) => {
      try {
        const stream = await setupAudioStream();

        const pc = (inviter.sessionDescriptionHandler as any)
          ?.peerConnection as RTCPeerConnection;

        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
          console.log(
            "[startCall] BEFORE replace/add: track.enabled =",
            track.enabled
          );

          const existingSender = pc
            ?.getSenders()
            .find((s) => s.track?.kind === "audio");

          if (existingSender) {
            console.log("[startCall] Replacing existing audio track");
            existingSender.replaceTrack(track);
          } else {
            console.log("[startCall] Adding new audio track");
            pc?.addTrack(track, stream);
          }

          console.log(
            "[startCall] AFTER replace/add: track.enabled =",
            track.enabled
          );
        });

        console.log("[startCall] Senders after setup:");
        pc?.getSenders().forEach((s, i) => {
          console.log(
            `Sender[${i}]: kind=${s.track?.kind}, enabled=${s.track?.enabled}`
          );
        });

        setParticipants([
          { id: "self", username: "You", avatar: "user.png" },
          { id: targetId, username: targetId, avatar: "user.png" },
        ]);

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

    const caller = invitation.remoteIdentity.uri.user || "unknown";
    setParticipants([
      { id: caller, username: caller, avatar: "user.png" },
      { id: "self", username: "You", avatar: "user.png" },
    ]);
  }, []);

  const acceptCall = useCallback(async () => {
    if (!incomingSession) return;
    try {
      const stream = await setupAudioStream();
      await incomingSession.accept();

      const pc = (incomingSession.sessionDescriptionHandler as any)
        ?.peerConnection as RTCPeerConnection;

      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
        console.log(
          "[acceptCall] BEFORE replace/add: track.enabled =",
          track.enabled
        );

        const existingSender = pc
          ?.getSenders()
          .find((s) => s.track?.kind === "audio");

        if (existingSender) {
          console.log("[acceptCall] Replacing existing audio track");
          existingSender.replaceTrack(track);
        } else {
          console.log("[acceptCall] Adding new audio track");
          pc?.addTrack(track, stream);
        }

        console.log(
          "[acceptCall] AFTER replace/add: track.enabled =",
          track.enabled
        );
      });

      console.log("[acceptCall] Senders after setup:");
      pc?.getSenders().forEach((s, i) => {
        console.log(
          `Sender[${i}]: kind=${s.track?.kind}, enabled=${s.track?.enabled}`
        );
      });

      const caller = incomingSession.remoteIdentity.uri.user || "unknown";
      setParticipants([
        { id: caller, username: caller, avatar: "user.png" },
        { id: "self", username: "You", avatar: "user.png" },
      ]);

      setCurrentSession(incomingSession);
      setIncomingSession(null);
      setCallState("in-call");
    } catch (error) {
      console.error("Failed to accept call:", error);
      await hardResetCallState();
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
    audio.id = "remote-audio";
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.setAttribute("playsinline", "true");
    audio.style.display = "none";
    audio.volume = 1;

    if (
      outputDeviceIdRef.current &&
      typeof (audio as any).setSinkId === "function"
    ) {
      (audio as any).setSinkId(outputDeviceIdRef.current).catch(console.warn);
    }

    document.body.appendChild(audio);

    return () => {
      audio.pause();
      audio.srcObject = null;
      document.getElementById("remote-audio")?.remove();
    };
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
      if (newState === SessionState.Terminated) {
        setCallState("ended");
        setTimeout(async () => {
          await hardResetCallState();
        }, 1000);
      }
    };

    incomingSession.stateChange.addListener(onIncomingStateChange);
    return () => {
      incomingSession.stateChange.removeListener(onIncomingStateChange);
    };
  }, [incomingSession, hardResetCallState]);

  useEffect(() => {
    if (!currentSession) return;

    const onStateChange = (newState: SessionState) => {
      if (newState === SessionState.Established && outgoingTimeoutRef.current) {
        clearTimeout(outgoingTimeoutRef.current);
        outgoingTimeoutRef.current = null;
      } else if (newState === SessionState.Terminated) {
        setCallState("ended");
        setTimeout(async () => {
          await hardResetCallState();
        }, 1000);
      }
    };

    currentSession.stateChange.addListener(onStateChange);
    return () => {
      currentSession.stateChange.removeListener(onStateChange);
    };
  }, [currentSession, hardResetCallState]);

  useEffect(() => {
    if (callState === "in-call") {
      const session = currentSession;
      const pc = (session?.sessionDescriptionHandler as any)?.peerConnection as
        | RTCPeerConnection
        | undefined;

      const sender = pc?.getSenders().find((s) => s.track?.kind === "audio");

      if (sender?.track) {
        sender.track.enabled = false;
        console.log(
          "[FORCE-MUTE] Enforcing mute after in-call: track.enabled =",
          sender.track.enabled
        );
      } else {
        console.warn("[FORCE-MUTE] Sender track not found");
      }
    }
  }, [callState, currentSession]);

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
        gainRef,
        audioContextRef,
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
