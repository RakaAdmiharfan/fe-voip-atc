"use client";
import { useCall } from "@/context/callContext";
import { IoMicOff, IoMic, IoCall } from "react-icons/io5";
import { useState, useEffect } from "react";
import { Session, SessionState } from "sip.js";

export default function CallUI() {
  const { isInCall, callSession, participants, endCall } = useCall();

  const [muted, setMuted] = useState(false);
  const [callStatus, setCallStatus] = useState("Ringing");

  useEffect(() => {
    if (!callSession) return;

    const handleStateChange = (state: SessionState) => {
      console.log("Call state changed:", state);
      if (state === SessionState.Established) {
        setCallStatus("Connected");
      } else if (state === SessionState.Terminated) {
        setCallStatus("Ended");
      }
    };

    callSession.stateChange.addListener(handleStateChange);

    return () => {
      callSession.stateChange.removeListener(handleStateChange);
    };
  }, [callSession]);

  if (!isInCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#1e1f22] rounded-xl p-6 w-[90vw] h-[90vh] flex flex-col items-center shadow-lg">
        {/* Call Status */}
        <div className="text-gray-300 text-lg mb-4 flex items-center gap-2">
          {callStatus === "Ringing" && (
            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></span>
          )}
          {callStatus}...
        </div>

        {/* Participants Grid */}
        <div
          className={`grid gap-4 w-full ${
            participants.length === 1
              ? "grid-cols-1"
              : participants.length <= 4
              ? "grid-cols-2"
              : "grid-cols-3 md:grid-cols-4"
          }`}
        >
          {participants.map((user) => (
            <div
              key={user.id}
              className={`relative flex flex-col items-center p-4 rounded-xl transition ${
                muted && user.id === "self" ? "bg-red-700/50" : "bg-gray-700"
              }`}
            >
              <div className="w-24 h-24 rounded-full border-4 border-gray-500 overflow-hidden flex items-center justify-center bg-gray-800">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2 text-gray-300 text-sm">{user.name}</span>
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="mt-auto flex gap-6 pb-4">
          <button
            onClick={() => setMuted(!muted)}
            className={`p-4 rounded-full transition text-white ${
              muted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#40444b] hover:bg-[#525760]"
            }`}
          >
            {muted ? <IoMicOff size={28} /> : <IoMic size={28} />}
          </button>

          <button
            onClick={endCall}
            className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition text-white"
          >
            <IoCall size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
