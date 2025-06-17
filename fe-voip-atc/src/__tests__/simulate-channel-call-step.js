// simulate-channel-call-step.js
import WebSocket from "ws";
import { argv } from "process";

const args = {};
argv.slice(2).forEach((arg) => {
  const [key, value] = arg.replace(/^--/, "").split("=");
  args[key] = value || true;
});

const vu = parseInt(args.vu) || 25;
const channelId = args.channelId || "6040";
const WS_URL = "wss://pttalk.id/ws";

let success = 0;
let failure = 0;

console.log(`\n🚀 Starting STEP simulation with ${vu} users on channel ${channelId}...`);

function createUser(index) {
  return new Promise((resolve) => {
    const userId = `test-${index}`;
    const username = `User ${index}`;
    const ws = new WebSocket(WS_URL);

    let isSuccess = false;
    const timeout = setTimeout(() => {
      if (!isSuccess) {
        console.log(`❌ [${userId}] No response within 10s`);
        failure++;
        ws.terminate();
        resolve();
      }
    }, 10000);

    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "register", userId, username }));
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "join-channel-call", channelId }));
      }, 200);
    });

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "conference-participants" && !isSuccess) {
          isSuccess = true;
          clearTimeout(timeout);
          console.log(`✅ [${userId}] Joined successfully`);
          success++;
          ws.close();
          resolve();
        }
      } catch (err) {
        console.error(`❌ [${userId}] Error parsing message`);
        failure++;
        ws.close();
        resolve();
      }
    });

    ws.on("error", (err) => {
      console.error(`❌ [${userId}] WebSocket error:`, err.message);
      clearTimeout(timeout);
      failure++;
      resolve();
    });
  });
}

(async () => {
  for (let i = 0; i < vu; i++) {
    await new Promise((res) => setTimeout(res, 100));
    createUser(i);
  }

  setTimeout(() => {
    console.log("\n📊 Simulation completed.");
    console.log(`Total Users: ${vu}`);
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failure}`);
    process.exit(0);
  }, 15000);
})();
