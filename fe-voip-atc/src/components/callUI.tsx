"use client";

import { useState, useEffect, useRef } from "react";
import { useCall } from "@/context/callContext";
import { IoMicOff, IoMic, IoCall, IoClose } from "react-icons/io5";
import { SessionState } from "sip.js";
import { toast } from "react-toastify";

function IncomingCallControls({
  callerId,
  onAccept,
  onReject,
}: {
  callerId: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="text-lg font-bold text-white">Incoming Call</h2>
      <p className="text-gray-300">
        From: <span className="font-semibold text-white">{callerId}</span>
      </p>
      <div className="flex justify-center gap-6 mt-4">
        <button
          onClick={onReject}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <IoClose size={26} />
        </button>
        <button
          onClick={onAccept}
          className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white"
        >
          <IoCall size={26} />
        </button>
      </div>
    </div>
  );
}

function OngoingCallControls({
  isPTTPressed,
  handleEnd,
}: {
  isPTTPressed: boolean;
  handleEnd: () => void;
}) {
  return (
    <>
      <button
        className={`p-4 rounded-full transition ${
          isPTTPressed
            ? "bg-[#40444b] hover:bg-[#525760]"
            : "bg-red-600 hover:bg-red-700"
        }`}
        title={isPTTPressed ? "Unmute (PTT Active)" : "Muted"}
      >
        {isPTTPressed ? <IoMic size={28} /> : <IoMicOff size={28} />}
      </button>
      <button
        onClick={handleEnd}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700"
        title="End Call"
      >
        <IoClose size={28} />
      </button>
    </>
  );
}

export default function CallUI() {
  const {
    currentSession,
    incomingSession,
    callState,
    participants,
    isChannel,
    acceptCall,
    rejectCall,
    endCall,
    leaveChannel,
    gainRef,
    audioContextRef,
  } = useCall();

  const [status, setStatus] = useState("Connecting...");
  const [isPTTPressed, setIsPTTPressed] = useState(false);
  const [pttKey, setPttKey] = useState("Control");
  const keyPressedRef = useRef(false);
  const getPeerConnection = () => {
    return (currentSession?.sessionDescriptionHandler as any)
      ?.peerConnection as RTCPeerConnection | undefined;
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ptt_key) setPttKey(data.ptt_key);
      })
      .catch((err) => {
        console.error("Failed to fetch pttKey", err);
        toast.error("Gagal memuat tombol PTT");
      });
  }, []);

  useEffect(() => {
    const session = currentSession || incomingSession;
    if (!session) return;

    const updateStatus = () => {
      const s = session.state;
      if (s === SessionState.Established) setStatus("Connected");
      else if (s === SessionState.Terminated) setStatus("Ended");
      else setStatus("Connecting...");
    };

    updateStatus();
    session.stateChange.addListener(updateStatus);
    return () => session.stateChange.removeListener(updateStatus);
  }, [currentSession, incomingSession]);

  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === pttKey && !keyPressedRef.current) {
  //       keyPressedRef.current = true;
  //       if (gainRef.current && audioContextRef.current) {
  //         gainRef.current.gain.setValueAtTime(
  //           1,
  //           audioContextRef.current.currentTime
  //         );
  //       }
  //       console.log("[PTT] Key down:", gainRef.current?.gain.value);

  //       setIsPTTPressed(true);
  //     }
  //   };

  //   const handleKeyUp = (e: KeyboardEvent) => {
  //     if (e.key === pttKey && keyPressedRef.current) {
  //       keyPressedRef.current = false;
  //       if (gainRef.current && audioContextRef.current) {
  //         gainRef.current.gain.setValueAtTime(
  //           0,
  //           audioContextRef.current.currentTime
  //         );
  //       }
  //       console.log("[PTT] Key up:", gainRef.current?.gain.value);

  //       setIsPTTPressed(false);
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   window.addEventListener("keyup", handleKeyUp);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("keyup", handleKeyUp);
  //   };
  // }, [pttKey, gainRef, audioContextRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === pttKey &&
        gainRef.current &&
        audioContextRef.current &&
        !keyPressedRef.current
      ) {
        keyPressedRef.current = true;
        gainRef.current.gain.setValueAtTime(
          1,
          audioContextRef.current.currentTime
        );

        // ✅ Enable track for outgoing stream
        const pc = getPeerConnection();
        const track = pc
          ?.getSenders()
          .find((s) => s.track?.kind === "audio")?.track;
        if (track) {
          track.enabled = true;
          console.log("[PTT] gain =", gainRef.current?.gain.value);
          console.log("[PTT] track.enabled =", track?.enabled);
        }

        setIsPTTPressed(true);
        console.log("[PTT] Key down: gain =", gainRef.current.gain.value);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === pttKey &&
        gainRef.current &&
        audioContextRef.current &&
        keyPressedRef.current
      ) {
        keyPressedRef.current = false;
        gainRef.current.gain.setValueAtTime(
          0,
          audioContextRef.current.currentTime
        );

        // ✅ Disable track so remote peer gets no audio
        const pc = getPeerConnection();
        const track = pc
          ?.getSenders()
          .find((s) => s.track?.kind === "audio")?.track;

        if (track) {
          track.enabled = false;
          console.log("[PTT] gain =", gainRef.current?.gain.value);
          console.log("[PTT] track.enabled =", track?.enabled);
        }

        setIsPTTPressed(false);
        console.log("[PTT] Key up: gain =", gainRef.current.gain.value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pttKey, currentSession]);

  // useEffect(() => {
  //   if (callState === "ended") {
  //     try {
  //       audioContextRef.current?.close();
  //     } catch (e) {
  //       console.warn("Failed to close audio context:", e);
  //     }
  //     gainRef.current = null;
  //   }
  // }, [callState]);

  const handleEnd = isChannel ? leaveChannel : endCall;

  if (callState === "idle") return null;

  const callerId =
    incomingSession?.remoteIdentity?.displayName ||
    incomingSession?.remoteIdentity?.uri?.user ||
    "Unknown";

  return (
    <section className="absolute inset-0 z-40 bg-[#2f3136] text-white flex flex-col px-6 py-4 overflow-hidden">
      {isPTTPressed && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded">
          PTT Active
        </div>
      )}
      <div className="text-left mb-6">
        <h2 className="text-xl font-semibold">{status}</h2>
        <p className="text-sm text-gray-400">
          {isChannel ? "Channel Mode" : "Private Call"}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div
          className={`grid gap-10 w-full max-w-6xl px-4 py-10 ${
            participants.length <= 1
              ? "grid-cols-1"
              : participants.length === 2
              ? "grid-cols-2"
              : participants.length <= 4
              ? "grid-cols-2 md:grid-cols-4"
              : "grid-cols-3 md:grid-cols-4"
          }`}
        >
          {participants.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center p-6 rounded-xl bg-[#292b2f] hover:bg-[#40444b] transition min-h-[200px]"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#202225] bg-[#202225] flex items-center justify-center shadow-md">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-5 text-base font-medium text-gray-200">
                {user.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 mb-4 flex gap-4 justify-center">
        {callState === "ringing" ? (
          <IncomingCallControls
            callerId={callerId}
            onAccept={acceptCall}
            onReject={rejectCall}
          />
        ) : (
          <OngoingCallControls
            isPTTPressed={isPTTPressed}
            handleEnd={handleEnd}
          />
        )}
      </div>
    </section>
  );
}
