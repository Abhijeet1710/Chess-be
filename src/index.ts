import { WebSocketServer } from "ws";
import http from "http";
import express from "express";
import { InItEvent } from "./utils/types";
import { WsManager } from "./ws-manager/ws_manager";
import authRouter from "./auth";
import cors from "cors"

// UI from 1:17:25 Chutiya vdo wala

const app = express();

app.use(cors())
app.use(express.json())
app.use("/api/v1", authRouter);

const server = http.createServer(app);
WsManager.initWebSockerServer(server);


server.listen(8080);
