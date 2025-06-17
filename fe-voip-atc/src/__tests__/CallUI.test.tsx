import { CallContext } from "@/context/callContext";
import { render, act } from "@testing-library/react";
import CallUI from "@/components/callUI";
import * as pcUtils from "@/lib/getPeerConnection";

let trackMock: { kind: string; enabled: boolean };
// ✅ BEGIN: Mock Provider
const MockCallProvider = ({ children }: any) => {
  const gainMock = { gain: { setValueAtTime: jest.fn(), value: 0 } };
  const audioContextMock = { currentTime: 1000 };
  trackMock = { kind: "audio", enabled: false };

  const mockSession = {
    stateChange: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  };

  const contextValue = {
    currentSession: mockSession,
    incomingSession: null,
    callState: "in-call",
    participants: [{ id: "123", username: "You", avatar: "test-avatar.png" }],
    setCurrentSession: jest.fn(),
    setIncomingSession: jest.fn(),
    setCallState: jest.fn(),
    setParticipants: jest.fn(),
    startCall: jest.fn(),
    receiveCall: jest.fn(),
    acceptCall: jest.fn(),
    rejectCall: jest.fn(),
    endCall: jest.fn(),
    joinChannelCall: jest.fn(),
    leaveChannel: jest.fn(),
    isChannel: false,
    setIsChannel: jest.fn(),
    gainRef: { current: gainMock },
    audioContextRef: { current: audioContextMock },
  };

  jest.spyOn(pcUtils, "getPeerConnection").mockReturnValue({
    getSenders: () => [{ track: trackMock }],
  });

  global.fetch = jest.fn((url) =>
    Promise.resolve({
      json: () =>
        Promise.resolve(
          url.includes("settings")
            ? { ptt_key: "Control" }
            : { id: "123", username: "You" }
        ),
    })
  ) as any;

  return (
    <CallContext.Provider value={contextValue}>
      {children}
    </CallContext.Provider>
  );
};
// ✅ END: Mock Provider

// ✅ TEST
describe("CallUI PTT Feature", () => {
  test("keydown and keyup simulate Push-to-Talk activation", async () => {
    render(
      <MockCallProvider>
        <CallUI />
      </MockCallProvider>
    );

    const keydown = new KeyboardEvent("keydown", { key: "Control" });
    const keyup = new KeyboardEvent("keyup", { key: "Control" });

    await act(() => {
      window.dispatchEvent(keydown);
      return Promise.resolve();
    });

    expect(trackMock.enabled).toBe(true);

    await act(() => {
      window.dispatchEvent(keyup);
      return Promise.resolve();
    });

    expect(trackMock.enabled).toBe(false);
  });
});
