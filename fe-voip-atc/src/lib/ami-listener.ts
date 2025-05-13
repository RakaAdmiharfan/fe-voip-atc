import AsteriskManager from "asterisk-manager";
import { Server as SocketIOServer } from "socket.io";

interface AmiEvent {
  Event: "ConfBridgeJoin" | "ConfBridgeLeave";
  CallerIDNum: string;
  CallerIDName: string;
  Conference: string;
}

type AmiConnection = {
  on: (event: "event", callback: (event: AmiEvent) => void) => void;
  keepConnected: () => void;
};

export function attachAmiListeners(io: SocketIOServer) {
  const ami = AsteriskManager(
    5038,
    "127.0.0.1",
    "webrtcadmin",
    "supersecret123",
    true
  ) as AmiConnection;

  ami.keepConnected();

  ami.on("event", (event) => {
    const payload = {
      type: event.Event,
      user: event.CallerIDNum,
      name: event.CallerIDName,
      room: event.Conference,
    };
    io.to(event.Conference).emit("conferenceEvent", payload);
  });

  console.log("AMI listener aktif");
}
