import { WebSocketServer } from "ws"
import { InItEvent } from "../utils/types"
import { GameManager } from "../game-manager/game_manager"

export class WsManager {
    private static instance: WsManager
    private wssServer: WebSocketServer
    private gameManager: GameManager


    private constructor(server: any) {
        this.wssServer = new WebSocketServer({server})
        this.gameManager = GameManager.getInstance()

        this.wssServer.on('connection', (wsCon) => {
            this.gameManager.newPlayerConnection(wsCon)
        })
    } 

    static initWebSockerServer(server: any): void {
        if(!this.instance) {
            this.instance = new WsManager(server)
        }
    }
    
}