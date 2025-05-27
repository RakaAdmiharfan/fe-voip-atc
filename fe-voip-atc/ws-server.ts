import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import "dotenv/config";
import { createRedis } from "./src/lib/redis";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

interface ClientInfo {
  userId: string;
  channelId?: string;
  username?: string;
}

const clients = new Map<WebSocket, ClientInfo>();
const redis = createRedis();

wss.on("connection", (ws) => {
  console.log(
    `[${new Date().toISOString()}] 🟢 New WebSocket client connected`
  );
  clients.set(ws, { userId: "unknown" });

  ws.on("message", async (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (err) {
      console.error("❌ Failed to parse message:", err);
      return;
    }

    console.log("📨 Message from client:", data);

    // 🔐 Register user
    if (data.type === "register") {
      if (!data.userId) {
        console.warn("⚠️ Missing userId in register");
        return;
      }

      clients.set(ws, {
        userId: data.userId,
        username: data.username,
      });

      console.log(`✅ Registered user ${data.userId} (${data.username})`);
      return;
    }

    // 🎧 Join channel
    if (data.type === "join-channel-call") {
      const clientInfo = clients.get(ws);

      // 🛡️ Cegah user yang belum register
      if (!clientInfo || clientInfo.userId === "unknown") {
        console.warn("❌ User belum register, tolak join-channel-call");
        return;
      }

      clients.set(ws, {
        ...clientInfo,
        channelId: data.channelId,
      });

      await redis.sadd(
        `call:channel:${data.channelId}:participants`,
        clientInfo.userId
      );

      const participantList = Array.from(clients.entries())
        .filter(([_, info]) => info.channelId === data.channelId)
        .map(([_, info]) => ({
          id: info.userId,
          username: info.username || "Unknown",
        }));

      console.log("📤 Broadcast participants (JOIN):", participantList);

      for (const [client, info] of clients.entries()) {
        if (
          client.readyState === WebSocket.OPEN &&
          info.channelId === data.channelId
        ) {
          client.send(
            JSON.stringify({
              type: "conference-participants",
              participants: participantList,
            })
          );
        }
      }

      console.log(`👥 ${clientInfo.userId} joined channel ${data.channelId}`);
    }

    // 👋 Leave channel
    if (data.type === "leave-channel-call") {
      const clientInfo = clients.get(ws);
      if (!clientInfo || !clientInfo.channelId) return;

      const leftChannel = clientInfo.channelId;

      // ✅ Tetap simpan salinan sebelum dihapus
      const updatedInfo = { ...clientInfo };
      delete clientInfo.channelId;
      clients.set(ws, clientInfo); // perbarui Map

      try {
        // ❌ Hapus dari Redis
        await redis.srem(
          `call:channel:${leftChannel}:participants`,
          updatedInfo.userId
        );

        const redisKey = `call:channel:${leftChannel}:participants`;
        const remainingIds = await redis.smembers(redisKey);

        if (remainingIds.length === 0) {
          await redis.del(redisKey);
        }

        // ✅ Ambil peserta terkini dari memory
        const participantList = Array.from(clients.entries())
          .filter(([_, info]) => info.channelId === leftChannel)
          .map(([_, info]) => ({
            id: info.userId,
            username: info.username || "Unknown",
          }));

        console.log("📤 Broadcast participants (LEAVE):", participantList);

        // 🔄 Kirim update ke semua client yang masih di channel
        for (const [client, info] of clients.entries()) {
          if (
            client.readyState === WebSocket.OPEN &&
            info.channelId === leftChannel
          ) {
            client.send(
              JSON.stringify({
                type: "conference-participants",
                participants: participantList,
              })
            );
          }
        }

        console.log(`🚪 ${updatedInfo.userId} left channel ${leftChannel}`);
      } catch (err) {
        console.error("❌ Error during leave-channel-call:", err);
      }
    }
  });

  // 🔌 Disconnected
  ws.on("close", async () => {
    const info = clients.get(ws);
    clients.delete(ws);

    if (info?.channelId) {
      const channelId = info.channelId;

      // ❌ Hapus user dari Redis
      await redis.srem(`call:channel:${channelId}:participants`, info.userId);

      const remainingIds = await redis.smembers(
        `call:channel:${channelId}:participants`
      );
      if (remainingIds.length === 0) {
        await redis.del(`call:channel:${channelId}:participants`);
      }

      // ✅ Ambil peserta terkini dari memory
      const participantList = Array.from(clients.entries())
        .filter(([_, clientInfo]) => clientInfo.channelId === channelId)
        .map(([_, clientInfo]) => ({
          id: clientInfo.userId,
          username: clientInfo.username || "Unknown",
        }));

      console.log("📤 Broadcast participants (DISCONNECT):", participantList);

      // 🔄 Broadcast daftar peserta baru
      for (const [client, clientInfo] of clients.entries()) {
        if (
          client.readyState === WebSocket.OPEN &&
          clientInfo.channelId === channelId
        ) {
          client.send(
            JSON.stringify({
              type: "conference-participants",
              participants: participantList,
            })
          );
        }
      }

      console.log(`❌ ${info.userId} disconnected from channel ${channelId}`);
    } else {
      console.log(`❌ ${info?.userId || "unknown"} disconnected`);
    }
  });
});

// 🚀 Start WebSocket server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(
    `✅ WebSocket + Express server running at ${PORT}`
  );

  console.log(
    "🧪 Redis config:",
    process.env.REDIS_HOST,
    process.env.REDIS_PORT
  );
});
