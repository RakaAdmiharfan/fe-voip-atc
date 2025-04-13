"use client";

import { useCall } from "@/context/callContext";
import { IoMicOff, IoMic, IoCall, IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { SessionState } from "sip.js";

export default function CallUI() {
  const { currentSession, callState, participants, endCall, acceptCall } =
    useCall();
  const [muted, setMuted] = useState(false);
  const [callStatus, setCallStatus] = useState("Ringing");

  useEffect(() => {
    if (!currentSession) return;

    const handleStateChange = (state: SessionState) => {
      console.log("Call state changed:", state);
      if (state === SessionState.Established) {
        setCallStatus("Connected");
      } else if (state === SessionState.Terminated) {
        setCallStatus("Ended");
      }
    };

    currentSession.stateChange.addListener(handleStateChange);

    return () => {
      currentSession.stateChange.removeListener(handleStateChange);
    };
  }, [currentSession]);

  if (callState === "idle") return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#2f3136] text-white flex flex-col px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-[#40444b] pb-4">
        <h2 className="text-lg font-semibold text-white">{callStatus}</h2>
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
                <img src={user.avatar} className="w-full h-full object-cover" />
              </div>
              <span className="mt-5 text-base justify-center items-center font-medium text-gray-200">
                {user.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-auto flex justify-center gap-6 border-t border-[#40444b] pt-6">
        {callState === "ringing" ? (
          <>
            <button
              onClick={acceptCall}
              className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white"
            >
              <IoCall size={28} />
            </button>
            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <IoClose size={28} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setMuted(!muted)}
              className={`p-4 rounded-full text-white transition ${
                muted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#40444b] hover:bg-[#525760]"
              }`}
            >
              {muted ? <IoMicOff size={28} /> : <IoMic size={28} />}
            </button>
            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <IoCall size={28} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
