import { CallContext } from "@/context/callContext";
import { SessionState } from "sip.js";

export const MockCallProvider = ({ children, mock }: any) => {
  const defaultContext = {
    currentSession: null,
    incomingSession: null,
    callState: "in-call",
    participants: [],
    isChannel: false,
    acceptCall: jest.fn(),
    rejectCall: jest.fn(),
    endCall: jest.fn(),
    leaveChannel: jest.fn(),
    gainRef: { current: null },
    audioContextRef: { current: null },
  };

  return (
    <CallContext.Provider value={{ ...defaultContext, ...mock }}>
      {children}
    </CallContext.Provider>
  );
};
