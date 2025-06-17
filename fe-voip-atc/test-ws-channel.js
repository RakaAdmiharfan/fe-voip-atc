const WebSocket = require("ws");

const WS_URL = "wss://pttalk.id/ws";
const ws = new WebSocket(WS_URL);

const userId = "tes";
const username = "tes";
const channelId = "6037"; // sesuaikan channel yang aktif

ws.on("open", () => {
  console.log("[WS] Connected to server");

  // Step 1: Register
  const registerPayload = {
    type: "register",
    userId,
    username,
  };
  console.log("[WS] Sending register...");
  ws.send(JSON.stringify(registerPayload));
});

ws.on("message", (msg) => {
  const data = JSON.parse(msg);
  console.log("[WS] Received:", data);

  if (data.type === "register-success") {
    // Step 2: Join Channel
    const joinPayload = {
      type: "join-channel-call",
      channelId,
      userId,
    };
    console.log("[WS] Sending join-channel-call...");
    ws.send(JSON.stringify(joinPayload));
  }

  if (data.type === "conference-participants") {
    console.log(`[WS] Participants after join:`, data.participants);

    // Step 3: Leave Channel setelah delay
    setTimeout(() => {
      const leavePayload = {
        type: "leave-channel-call",
        channelId,
        userId,
      };
      console.log("[WS] Sending leave-channel-call...");
      ws.send(JSON.stringify(leavePayload));
    }, 2000);
  }

  if (data.type === "conference-participants" && data.participants.length === 0) {
    console.log("[WS] ✅ Successfully left the channel.");
    ws.close();
  }
});

ws.on("close", () => {
  console.log("[WS] Connection closed");
});

ws.on("error", (err) => {
  console.error("[WS] Error:", err);
});