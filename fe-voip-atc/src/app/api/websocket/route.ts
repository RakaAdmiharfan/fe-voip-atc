import { WebSocketServer } from "ws";

export default function handler(req: any, res: any) {
  if (!res.socket.server.ws) {
    console.log("Initializing WebSocket server...");

    const wss = new WebSocketServer({ server: res.socket.server });

    wss.on("connection", (ws) => {
      console.log("New WebSocket connection");

      // Koneksi ke Asterisk
      const asteriskWs = new WebSocket(
        "ws://16.78.90.15:8088/ari/events?api_key=username:password1"
      );

      asteriskWs.onmessage = (message) => {
        ws.send(message.data);
      };

      ws.on("close", () => {
        asteriskWs.close();
      });
    });

    res.socket.server.ws = wss;
  }
  res.end();
}
