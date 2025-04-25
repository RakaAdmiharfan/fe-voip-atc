"use client";

import { useCall } from "@/context/callContext";
import { IoMicOff, IoMic, IoCall, IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { SessionState } from "sip.js";

export default function CallUI() {
  const {
    currentSession,
    callState,
    participants,
    isChannel,
    endCall,
    acceptCall,
    leaveChannel,
  } = useCall();

  const [muted, setMuted] = useState(false);
  const [callStatus, setCallStatus] = useState("Ringing");

  const handleEnd = isChannel ? leaveChannel : endCall;

  const toggleMute = () => {
    setMuted((prev) => {
      const newMuted = !prev;
      const pc = (currentSession?.sessionDescriptionHandler as any)
        ?.peerConnection as RTCPeerConnection;
      if (pc) {
        pc.getSenders().forEach((sender) => {
          if (sender.track?.kind === "audio") {
            sender.track.enabled = !newMuted;
          }
        });
      }
      return newMuted;
    });
  };

  useEffect(() => {
    if (!currentSession) return;

    const handler = (state: SessionState) => {
      console.log("Call state changed:", state);
      if (state === SessionState.Established) {
        setCallStatus("Connected");
      } else if (state === SessionState.Terminated) {
        setCallStatus("Ended");
      }
    };

    // ⬇️ Pasang listener
    currentSession.stateChange.addListener(handler);

    // ⬇️ Tambahkan ini untuk deteksi state awal
    handler(currentSession.state);

    return () => {
      currentSession.stateChange.removeListener(handler);
    };
  }, [currentSession]);

  if (callState === "idle") return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#2f3136] text-white flex flex-col px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-[#40444b] pb-4">
        <div>
          <h2 className="text-lg font-semibold">{callStatus}</h2>
          {isChannel && (
            <p className="text-sm text-gray-400 mt-1">Channel Mode</p>
          )}
        </div>
      </div>

      {/* Participants */}
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

      {/* Waiting note */}
      {isChannel && participants.length === 1 && (
        <div className="text-center mb-4 text-gray-400 text-sm">
          Waiting for others to join the channel...
        </div>
      )}

      {/* Controls */}
      <div className="mt-auto flex justify-center gap-6 border-t border-[#40444b] pt-6">
        {callState === "ringing" ? (
          <>
            <button
              onClick={acceptCall}
              className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white"
              title="Accept Call"
            >
              <IoCall size={28} />
            </button>
            <button
              onClick={handleEnd}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
              title="Decline"
            >
              <IoClose size={28} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full text-white transition ${
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
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
              title={isChannel ? "Leave Channel" : "End Call"}
            >
              <IoClose size={28} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
