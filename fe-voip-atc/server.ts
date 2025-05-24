// import express from "express";
// import next from "next";
// import { createServer } from "http";
// import { Server as SocketIOServer } from "socket.io";
// import { attachAmiListeners } from "@/lib/ami-listener";

// const dev = process.env.NODE_ENV !== "production";
// const hostname = "0.0.0.0";
// const port = parseInt(process.env.PORT || "4000", 10);
// const app = next({ dev, hostname, port });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const expressApp = express();
//   const httpServer = createServer(expressApp);
//   const io = new SocketIOServer(httpServer, {
//     path: "/socket",
//     cors: { origin: "*" },
//   });

//   // Jalankan AMI listener
//   attachAmiListeners(io);

//   expressApp.all("*", (req, res) => handle(req, res));
//   httpServer.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
//   });
// });
