"use client";

import { useCall } from "@/context/callContext";
import { IoCall, IoClose } from "react-icons/io5";

export default function IncomingCallUI() {
  const { incomingSession, acceptCall, declineCall, callState } = useCall();

  if (!incomingSession || callState !== "ringing") return null;

  const caller =
    incomingSession.remoteIdentity.displayName ||
    incomingSession.remoteIdentity.uri.user ||
    "Unknown";

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[#2f3136] border border-[#40444b] text-white rounded-xl px-6 py-4 shadow-lg w-full max-w-md z-50">
      <div className="text-center space-y-3">
        <h2 className="text-lg font-bold text-orange-400">Incoming Call</h2>
        <p className="text-gray-300">
          From: <span className="font-semibold text-white">{caller}</span>
        </p>
        <div className="flex justify-center gap-6 mt-2">
          <button
            onClick={declineCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
            aria-label="Decline call"
          >
            <IoClose size={24} />
          </button>
          <button
            onClick={acceptCall}
            className="p-3 rounded-full bg-green-600 hover:bg-green-700 text-white"
            aria-label="Accept call"
          >
            <IoCall size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
