"use client";

import { useCall } from "@/context/callContext";
import CallUI from "@/components/callUI";
import IncomingCallUI from "@/components/IncomingCallUI";

export default function FloatingCallUIWrapper() {
  const { callState, incomingSession } = useCall();

  if (callState === "idle" && !incomingSession) return null;

  return (
    <>
      {incomingSession && callState === "ringing" && <IncomingCallUI />}
      {callState !== "idle" && <CallUI />}
    </>
  );
}
