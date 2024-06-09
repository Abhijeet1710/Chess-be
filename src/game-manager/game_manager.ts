import { WebSocket } from "ws";
import { v4 as uuidv4 } from 'uuid';
import {
  ClientEvent,
  ClientEvents,
  Player,
  ServerEvents,
  WAITING_FOR_OPPONENT,
} from "../utils/types";
import { Chess } from 'chess.js'
import { Game } from "./Game";


export class GameManager {
  private static instance: GameManager;
  private runningGames: Game[] = [];
  private waitingPlayer: Player | null = null;
  private onlinePlayers: WebSocket[] = [];

  private constructor() {}

  static getInstance(): GameManager {
    if (!this.instance) {
      this.instance = new GameManager();
    }

    return this.instance;
  }

  public newPlayerConnection(wsCon: WebSocket): void {
    this.sendEvent(wsCon, {message: "online"}, 200);
    this.addEventHandler(wsCon);
    this.onlinePlayers.push(wsCon);
  }

  private addEventHandler(wsCon: WebSocket) {
    wsCon.on("message", (event: ClientEvent) => {
      event = JSON.parse(event.toString());
      console.log(`${event.type} : ${JSON.stringify(event.payload)}`);

      switch (event.type) {
        case ClientEvents.INIT: {
          this.addReadyToPlayPlayer(wsCon, event.payload);
          break;
        }

        case ClientEvents.MOVE: {
            this.handleMove(event.payload.gameId, {from: event.payload.from, to: event.payload.to})
        }
      }
    });

    wsCon.on("error", (er) => {
      console.log("Error ", er);
    });

    wsCon.on("close", (d) => {
      console.log("disconnect", d);
    });
  }

  private addReadyToPlayPlayer(
    wsCon: WebSocket,
    userDetails: { userName: string }
  ) {
    console.log("XX : "+userDetails.userName, this.waitingPlayer?.userName);

    if (this.waitingPlayer) {
      // create this a second/black player
      const blackPlayer: Player = new Player(userDetails.userName, null, wsCon);

      // create a new game and start a game
      const newGame = new Game(this.waitingPlayer, blackPlayer)

      // console.log(newGame.board.board());
      this.runningGames.push(newGame);

      // send starting a game event to both the player
      this.sendEvent(this.waitingPlayer.userWs, {
        type: ServerEvents.STARTED,
        payload: {
            gameId: newGame.gameId,
            message: "WHITE",
            fen: newGame.getBoard().fen()
        }
      }, 200);

      this.sendEvent(wsCon, {
        type: ServerEvents.STARTED,
        payload: {
            gameId: newGame.gameId,
            message: "BLACK",
            fen: newGame.getBoard().fen()
        }
      },200);

      this.waitingPlayer = null;
    } else {
      // no one is waiting so this player is the first/white player
      // create a Player and keep it in waitingPlayer
      const whitePlayer: Player = new Player(userDetails.userName, null, wsCon);
      this.waitingPlayer = whitePlayer;
      // send waiting for a opponent event to this player
      this.sendEvent(wsCon, {
        type: ServerEvents.WAITING,
        payload: { message: WAITING_FOR_OPPONENT }
      }, 200);
    }
  }

  private handleMove(gameId: string, move: {from: string, to: string}) {
      const game = this.runningGames.find((g) => g.gameId == gameId)

      let resp = game!.movePiece(move)
      let event = {type: ServerEvents.MOVE_STATUS, payload: resp}
      console.log("handleMove resp : "+ JSON.stringify(event))
      

      this.sendEvent(game!.getWhitePlayer().userWs, event, null)
      this.sendEvent(game!.getBlackPlayer().userWs, event, null)
  }

  private sendEvent(wsCon: WebSocket, event: any, statusCode: number | null) {
    event.meta = { from: "server", time: new Date(), statusCode};
    wsCon.send(JSON.stringify(event));
  }
}
