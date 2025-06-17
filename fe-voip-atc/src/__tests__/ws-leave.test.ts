// src/__tests__/ws-leave.test.ts
import WebSocket from "ws";

const WS_URL = "ws://localhost:3001";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

describe("WebSocket Leave Channel Call", () => {
  let ws: WebSocket;

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  test(
    "should leave channel and get updated empty participant list",
    (done) => {
      ws = new WebSocket(WS_URL);

      ws.on("open", async () => {
        ws.send(JSON.stringify({ type: "register", userId: "u2", username: "Amjad" }));
        await delay(100);
        ws.send(JSON.stringify({ type: "join-channel-call", channelId: "room999" }));
        await delay(100);
        ws.send(JSON.stringify({ type: "leave-channel-call" }));
      });

      ws.on("message", async (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.type === "conference-participants" && data.participants.length === 0) {
          expect(data.participants).toEqual([]);
          await delay(50);
          done();
        }
      });
    },
    20000
  );
});
