import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// Setup HTTP server (Express) + WebSocket di port yang sama
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Set client list
const clients = new Set<WebSocket>();

// When WebSocket client connects
wss.on("connection", (ws) => {
  console.log("🟢 New WebSocket client connected");
  clients.add(ws);

  ws.send(
    JSON.stringify({ type: "welcome", message: "Connected to WS server" })
  );

  ws.on("close", () => {
    console.log("🔴 Client disconnected");
    clients.delete(ws);
  });

  ws.on("message", (message) => {
    console.log("📨 Received from client:", message.toString());
  });
});

// When Next.js API POSTs to this endpoint
app.post("/broadcast", (req, res) => {
  const message = req.body;

  console.log("🌐 Broadcast message from API:", message);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  res.sendStatus(200);
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(
    `✅ WebSocket + Express server running at http://localhost:${PORT}`
  );
});
