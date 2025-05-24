"use client";

import { getPeerConnection } from "@/lib/getPeerConnection";
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
// import { socket } from "@/lib/socket";

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
  joinChannelCall: (conferenceNumber: string, inviter: Inviter) => void; // ✅
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
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const userId = useRef<string>("");

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
      console.warn("AudioContext already closed or failed to close", err);
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

  const leaveChannel = useCallback(async () => {
    try {
      if (isChannel && currentRoom) {
        // Inform server untuk leave socket room
        socket.emit("leave-conference-room", {
          room: currentRoom,
          userId: userId.current,
        });

        // Kirim BYE ke Asterisk jika masih aktif
        if (
          currentSession &&
          currentSession.state === SessionState.Established
        ) {
          await currentSession.bye();
        }

        setCallState("ended");

        setTimeout(async () => {
          await hardResetCallState();
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to leave channel:", err);
      await hardResetCallState();
    }
  }, [currentSession, isChannel, currentRoom, hardResetCallState]);

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

  const joinChannelCall = useCallback(
    async (conferenceNumber: string, inviter: Inviter) => {
      try {
        const stream = await setupAudioStream();
        const pc = getPeerConnection(inviter);

        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;

          const existingSender = pc
            ?.getSenders()
            .find((s) => s.track?.kind === "audio");

          if (existingSender) {
            existingSender.replaceTrack(track);
          } else {
            pc?.addTrack(track, stream);
          }
        });

        setParticipants([
          { id: userId.current, username: "You", avatar: "user.png" },
        ]);
        setIsChannel(true);
        setCallState("in-call");
        setCurrentSession(inviter);
        setCurrentRoom(conferenceNumber);

        // Join ke socket room + kirim identitas
        socket.emit("join-conference-room", {
          room: conferenceNumber,
          userId: userId.current,
        });
      } catch (err) {
        console.error("joinChannelCall failed:", err);
        hardResetCallState();
      }
    },
    [hardResetCallState]
  );

  const startCall = useCallback(
    async (inviter: Inviter, targetId: string) => {
      try {
        const stream = await setupAudioStream();

        const pc = getPeerConnection(inviter);

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
          { id: userId.current, username: "You", avatar: "user.png" },
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
      { id: userId.current, username: "You", avatar: "user.png" },
    ]);
  }, []);

  const acceptCall = useCallback(async () => {
    if (!incomingSession) return;
    try {
      const stream = await setupAudioStream();
      await incomingSession.accept();

      const pc = getPeerConnection(incomingSession);

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
        { id: userId.current, username: "You", avatar: "user.png" },
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

    if (outputDeviceIdRef.current && typeof audio.setSinkId === "function") {
      audio.setSinkId(outputDeviceIdRef.current).catch(console.warn);
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
      const pc = getPeerConnection(currentSession);
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

  useEffect(() => {
    if (!isChannel || !currentRoom) return;

    const handleInit = (userIds: string[]) => {
      const formatted = userIds.map((id) => ({
        id,
        username: id === userId.current ? "You" : id,
        avatar: "user.png",
      }));
      setParticipants(formatted);
    };

    const handleUpdate = ({
      type,
      user,
      participants,
    }: {
      type: string;
      user: string;
      participants: string[];
    }) => {
      const formatted = participants.map((id) => ({
        id,
        username: id === userId.current ? "You" : id,
        avatar: "user.png",
      }));
      setParticipants(formatted);
    };

    socket.on("conference-participants", handleInit);
    socket.on("conferenceEvent", handleUpdate);

    return () => {
      socket.off("conference-participants", handleInit);
      socket.off("conferenceEvent", handleUpdate);
    };
  }, [isChannel, currentRoom]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok && data?.id) {
          userId.current = data.id;
        } else {
          console.warn("User not authenticated");
        }
      } catch (err) {
        console.error("Failed to fetch user ID:", err);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!isChannel || !currentRoom) return;

    const handleInit = (userIds: string[]) => {
      console.log("📥 [SOCKET] conference-participants", userIds);
      setParticipants(
        userIds.map((id) => ({
          id,
          username: id === userId.current ? "You" : id,
          avatar: "user.png",
        }))
      );
    };

    const handleUpdate = (event: {
      type: string;
      user: string;
      name: string;
      room: string;
      participants: string[];
    }) => {
      console.log("📥 [SOCKET] conferenceEvent", event);
      setParticipants(
        event.participants.map((id) => ({
          id,
          username: id === userId.current ? "You" : id,
          avatar: "user.png",
        }))
      );
    };

    socket.on("conference-participants", handleInit);
    socket.on("conferenceEvent", handleUpdate);

    return () => {
      socket.off("conference-participants", handleInit);
      socket.off("conferenceEvent", handleUpdate);
    };
  }, [isChannel, currentRoom]);

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
        joinChannelCall,
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
