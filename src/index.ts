import { WebSocketServer } from "ws";
import http from "http"
import express from "express"
import { InItEvent } from "./utils/types";
import { WsManager } from "./ws-manager/ws_manager";

// UI from 1:17:25 Chutiya vdo wala

const app = express()
app.get("/init-game", (req, res) => {
    res.status(200).json({message: "game initialized"})
})

const server = http.createServer(app)

WsManager.initWebSockerServer(server)

server.listen(8080)