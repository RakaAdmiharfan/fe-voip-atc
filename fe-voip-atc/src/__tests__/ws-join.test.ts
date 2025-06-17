// src/__tests__/ws-join.test.ts
import WebSocket from "ws";

const WS_URL = "ws://localhost:3001";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

describe("WebSocket Join Channel Call", () => {
  let ws: WebSocket;

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  test("should register and join a channel, then receive participant list", (done) => {
    ws = new WebSocket(WS_URL);

    ws.on("open", async () => {
      ws.send(JSON.stringify({ type: "register", userId: "u1", username: "Raka" }));
      await delay(100);
      ws.send(JSON.stringify({ type: "join-channel-call", channelId: "room123" }));
    });

    ws.on("message", (msg) => {
      const data = JSON.parse(msg.toString());
      if (data.type === "conference-participants") {
        expect(data.participants).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: "u1", username: "Raka" }),
          ])
        );
        done();
      }
    });
  });
});
