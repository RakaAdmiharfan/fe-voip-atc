// import AsteriskManager from "asterisk-manager";
// import { Server as SocketIOServer } from "socket.io";

// interface AmiEvent {
//   Event: "ConfBridgeJoin" | "ConfBridgeLeave";
//   CallerIDNum: string;
//   CallerIDName: string;
//   Conference: string;
// }

// type AmiConnection = {
//   on: (event: "event", callback: (event: AmiEvent) => void) => void;
//   keepConnected: () => void;
// };

// // Simpan state peserta tiap conference room
// const conferenceState: Record<string, Set<string>> = {};

// export function attachAmiListeners(io: SocketIOServer) {
//   const ami = AsteriskManager(
//     parseInt(process.env.AMI_PORT || "5038", 10),
//     process.env.AMI_HOST,
//     process.env.AMI_USER,
//     process.env.AMI_PASS,
//     true
//   ) as AmiConnection;

//   ami.keepConnected();

//   ami.on("event", (event) => {
//     if (event.Event !== "ConfBridgeJoin" && event.Event !== "ConfBridgeLeave")
//       return;

//     const room = event.Conference;
//     const user = event.CallerIDNum;
//     const name = event.CallerIDName;

//     console.log(`📡 AMI Event: ${event.Event} | Room: ${room} | User: ${user} | Name: ${name}`);


//     if (!conferenceState[room]) {
//       conferenceState[room] = new Set();
//     }

//     if (event.Event === "ConfBridgeJoin") {
//       conferenceState[room].add(user);
//     } else if (event.Event === "ConfBridgeLeave") {
//       conferenceState[room].delete(user);
//     }

//     io.to(room).emit("conferenceEvent", {
//       type: event.Event,
//       user,
//       name,
//       room,
//       participants: Array.from(conferenceState[room]),
//     });
//   });

//   io.on("connection", (socket) => {
//     socket.on("join-conference-room", ({ room, userId }) => {
//       socket.join(room);

//       // Tambahkan user ke conferenceState jika belum ada
//       if (!conferenceState[room]) {
//         conferenceState[room] = new Set();
//       }
//       conferenceState[room].add(userId);

//       // Kirim daftar peserta saat ini ke user baru
//       socket.emit("conference-participants", Array.from(conferenceState[room]));

//       // Beritahu peserta lain bahwa user ini join
//       socket.to(room).emit("conferenceEvent", {
//         type: "manualJoin",
//         user: userId,
//         name: userId,
//         room,
//         participants: Array.from(conferenceState[room]),
//       });
//     });

//     socket.on("leave-conference-room", ({ room, userId }) => {
//       socket.leave(room);
//       if (conferenceState[room]) {
//         conferenceState[room].delete(userId);
//       }

//       socket.to(room).emit("conferenceEvent", {
//         type: "manualLeave",
//         user: userId,
//         name: userId,
//         room,
//         participants: Array.from(conferenceState[room] || []),
//       });
//     });
//   });

//   console.log("✅ AMI listener aktif dan socket.io sinkron");
// }
