"use client";

import { useState, useEffect } from "react";
import { useCall } from "@/context/callContext";
import { IoMicOff, IoMic, IoCall, IoClose } from "react-icons/io5";
import { SessionState } from "sip.js";

// === SUBCOMPONENTS ===

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
          aria-label="Decline call"
        >
          <IoClose size={26} />
        </button>
        <button
          onClick={onAccept}
          className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white"
          aria-label="Accept call"
        >
          <IoCall size={26} />
        </button>
      </div>
    </div>
  );
}

function OngoingCallControls({
  muted,
  toggleMute,
  handleEnd,
}: {
  muted: boolean;
  toggleMute: () => void;
  handleEnd: () => void;
}) {
  return (
    <>
      <button
        onClick={toggleMute}
        className={`p-4 rounded-full transition ${
          muted
            ? "bg-red-600 hover:bg-red-700"
            : "bg-[#40444b] hover:bg-[#525760]"
        }`}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <IoMicOff size={28} /> : <IoMic size={28} />}
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

// === MAIN CALL UI ===

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
  } = useCall();

  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const session = currentSession || incomingSession;
    if (!session) return;

    const updateStatus = () => {
      const s = session.state;
      if (s === SessionState.Established) setStatus("Connected");
      else if (s === SessionState.Terminated) setStatus("Ended");
      else if (s === SessionState.Establishing || s === SessionState.Initial)
        setStatus("Connecting...");
    };

    updateStatus();
    session.stateChange.addListener(updateStatus);
    return () => session.stateChange.removeListener(updateStatus);
  }, [currentSession, incomingSession]);

  const toggleMute = () => {
    setMuted((prev) => {
      const newMuted = !prev;
      const pc = (currentSession?.sessionDescriptionHandler as any)
        ?.peerConnection as RTCPeerConnection;

      pc?.getSenders().forEach((sender) => {
        if (sender.track?.kind === "audio") {
          sender.track.enabled = !newMuted;
        }
      });

      return newMuted;
    });
  };

  const handleEnd = isChannel ? leaveChannel : endCall;
  if (callState === "idle") return null;

  const callerId =
    incomingSession?.remoteIdentity?.displayName ||
    incomingSession?.remoteIdentity?.uri?.user ||
    "Unknown";

  return (
    <section className="absolute inset-0 z-40 bg-[#2f3136] text-white flex flex-col px-6 py-4 overflow-hidden">
      <div className="text-left mb-6">
        <h2 className="text-xl font-semibold">{status}</h2>
        <p className="text-sm text-gray-400">
          {isChannel ? "Channel Mode" : "Private Call"}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div
          className={`grid gap-10 w-full max-w-6xl px-4 py-10 ${
            participants.length === 1
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
            muted={muted}
            toggleMute={toggleMute}
            handleEnd={handleEnd}
          />
        )}
      </div>
    </section>
  );
}
