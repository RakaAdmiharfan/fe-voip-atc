"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var next_1 = require("next");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var ami_listener_1 = require("@/lib/ami-listener");
var dev = process.env.NODE_ENV !== "production";
var hostname = "0.0.0.0";
var port = parseInt(process.env.PORT || "4000", 10);
var app = (0, next_1.default)({ dev: dev, hostname: hostname, port: port });
var handle = app.getRequestHandler();
app.prepare().then(function () {
    var expressApp = (0, express_1.default)();
    var httpServer = (0, http_1.createServer)(expressApp);
    var io = new socket_io_1.Server(httpServer, {
        path: "/socket",
        cors: { origin: "*" },
    });
    // Jalankan AMI listener
    (0, ami_listener_1.attachAmiListeners)(io);
    expressApp.all("*", function (req, res) { return handle(req, res); });
    httpServer.listen(port, function () {
        console.log("Server running at http://localhost:".concat(port));
    });
});
