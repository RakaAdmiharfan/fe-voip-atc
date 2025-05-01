"use client";

import { useState, useEffect } from "react";
import { useCall } from "@/context/callContext";
import { IoMicOff, IoMic, IoCall, IoClose } from "react-icons/io5";
import { SessionState } from "sip.js";

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

      pc?.getTransceivers().forEach((transceiver) => {
        if (transceiver.sender.track?.kind === "audio") {
          transceiver.direction = newMuted ? "recvonly" : "sendrecv";
        }
      });

      return newMuted;
    });
  };

  const handleEnd = isChannel ? leaveChannel : endCall;

  if (callState === "idle") return null;

  return (
    <section className="absolute inset-0 z-40 bg-[#2f3136] text-white flex flex-col px-6 py-4 overflow-hidden">
      <div className="text-left mb-6">
        <h2 className="text-xl font-semibold">{status}</h2>
        <p className="text-sm text-gray-400">
          {isChannel ? "Channel Mode" : "Private Call"}
        </p>
      </div>

      <div className="flex-1 flex items-center">
        <div className="mx-auto grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {participants.map((p) => (
            <div
              key={p.id}
              className="bg-[#292b2f] rounded-xl p-6 text-center w-60 h-52 flex flex-col items-center justify-center"
            >
              <img
                src={p.avatar}
                className="w-24 h-24 rounded-full object-cover"
                alt={p.username}
              />
              <p className="mt-3 text-base font-medium">{p.username}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex gap-4 justify-center">
        {callState === "ringing" ? (
          <>
            <button
              onClick={acceptCall}
              className="p-4 rounded-full bg-green-600 hover:bg-green-700"
              title="Accept Call"
            >
              <IoCall size={28} />
            </button>
            <button
              onClick={rejectCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700"
              title="Decline Call"
            >
              <IoClose size={28} />
            </button>
          </>
        ) : (
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
        )}
      </div>
    </section>
  );
}
