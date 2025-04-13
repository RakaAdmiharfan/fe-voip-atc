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
    <div className="absolute inset-0 z-50 bg-[#2f3136] text-white flex flex-col px-8 py-6">
      <div className="bg-[#2f3136] p-8 rounded-2xl shadow-2xl text-center w-[90%] max-w-sm space-y-6 border border-[#40444b]">
        <h2 className="text-2xl font-bold text-orange-400">Incoming Call</h2>
        <p className="text-gray-300">
          From: <span className="font-semibold text-white">{caller}</span>
        </p>

        <div className="flex justify-center gap-10 mt-4">
          <button
            onClick={declineCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
            aria-label="Reject call"
          >
            <IoClose size={28} />
          </button>
          <button
            onClick={acceptCall}
            className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white transition"
            aria-label="Accept call"
          >
            <IoCall size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
