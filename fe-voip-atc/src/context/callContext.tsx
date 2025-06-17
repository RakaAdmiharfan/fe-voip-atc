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
  id?: string;
  userId?: string;
  username?: string;
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

export const CallContext = createContext<CallContextType | undefined>(undefined);

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
  const usernameRef = useRef<string>("Unknown");
  const wsRef = useRef<WebSocket | null>(null);

  const fetchUserId = async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (res.ok && data?.id && data?.username) {
        userId.current = data.id;
        usernameRef.current = data.username;

        const tryRegister = () => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "register",
                userId: data.id,
                username: data.username,
              })
            );
            console.log("[WS] Registered after fetchUserId");
          } else {
            console.log("[WS] Not ready yet, retrying in 500ms...");
            setTimeout(tryRegister, 500); // Retry until ready
          }
        };

        tryRegister();
      } else {
        console.warn("User not authenticated");
      }
    } catch (err) {
      console.error("Failed to fetch user ID:", err);
    }
  };

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

  const setupAudioStream = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const availableInputIds = devices
      .filter((d) => d.kind === "audioinput")
      .map((d) => d.deviceId);

    const deviceId = inputDeviceIdRef.current;
    const isValidInput = deviceId && availableInputIds.includes(deviceId);

    const rawStream = await navigator.mediaDevices.getUserMedia({
      audio: isValidInput ? { deviceId: { exact: deviceId as string } } : true,
    });

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(rawStream);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    const destination = audioCtx.createMediaStreamDestination();
    source.connect(gainNode);
    gainNode.connect(destination);

    gainRef.current = gainNode;
    audioContextRef.current = audioCtx;

    return destination.stream;
  };

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
    if (!isChannel || !currentRoom || !userId.current) {
      console.warn("[leaveChannel] Not in a valid channel state");
      return;
    }

    try {
      // Inform WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const payload = {
          type: "leave-channel-call",
          channelId: currentRoom,
          userId: userId.current,
        };
        console.log("[WS] Sending leave-channel-call:", payload);
        wsRef.current.send(JSON.stringify(payload));
      } else {
        console.warn("[WS] WebSocket not open, cannot send leave-channel-call");
      }

      // Send BYE to Asterisk
      if (currentSession?.state === SessionState.Established) {
        await currentSession.bye();
        console.log("[SIP] Sent BYE to end session");
      }

      // Set state to ended first
      setCallState("ended");

      // Reset state after delay
      setTimeout(() => {
        hardResetCallState(); // don't await in timeout
      }, 1000);
    } catch (err) {
      console.error("[leaveChannel] Error:", err);
      await hardResetCallState();
    }
  }, [currentSession, isChannel, currentRoom, hardResetCallState]);

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

        setIsChannel(true);
        setCallState("in-call");
        setCurrentSession(inviter);
        setCurrentRoom(conferenceNumber);

        // ✅ Kirim event ke WebSocket server
        wsRef.current?.send(
          JSON.stringify({
            type: "join-channel-call",
            channelId: conferenceNumber,
            userId: userId.current,
            username: usernameRef.current,
          })
        );
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
    fetchUserId();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      if (userId.current) {
        ws.send(
          JSON.stringify({
            type: "register",
            userId: userId.current,
            username: usernameRef.current, // bisa ganti nama sesuai yang login
          })
        );
      }
    };

    ws.onmessage = (event) => {
      console.log("[WS] Raw message:", event.data); // Tambahkan ini

      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "conference-participants") {
          console.log("[WS] Participants message received:", msg); // Tambahkan ini

          const formatted = msg.participants.map((p: Participant) => {
            const id = p.id || p.userId || p;
            const username = id === userId.current ? "You" : p.username || id;
            return {
              id,
              username,
              avatar: "user.png",
            };
          });

          setParticipants(formatted);
          console.log("[WS] Participants update:", formatted);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.warn("[WS] Disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

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
