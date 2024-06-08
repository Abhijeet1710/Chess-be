import { WebSocket } from "ws";
import {
  ClientEvent,
  ClientEvents,
  Game,
  Player,
  ServerEvents,
  WAITING_FOR_OPPONENT,
} from "../utils/types";
import { v4 as uuidv4 } from "uuid";

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
    wsCon.send("online");
    this.addEventHandler(wsCon);
    this.onlinePlayers.push(wsCon);
  }

  private addEventHandler(wsCon: WebSocket) {
    wsCon.on("message", (event: ClientEvent) => {
      event = JSON.parse(event.toString());

      switch (event.type) {
        case ClientEvents.INIT: {
          this.addReadyToPlayPlayer(wsCon, event.payload);
          break;
        }

        case ClientEvents.MOVE: {
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
    if (this.waitingPlayer) {
      // create this a second/black player
      const blackPlayer: Player = new Player(userDetails.userName, null, wsCon);

      // create a new game and start a game
      const newGame: Game = {
        whitePlayer: this.waitingPlayer,
        whitePlayersTimeRemaining: new Date().toLocaleDateString(),
        blackPlayer,
        blackPlayersTimeRemaining: new Date().toLocaleDateString(),
        isWhitesTurn: true,
      };

      this.runningGames.push(newGame);

      // send starting a game event to both the player
      this.sendEvent(this.waitingPlayer.userWs, {
        type: ServerEvents.STARTED,
        payload: {
            message: "You are White"
        }
      });

      this.sendEvent(wsCon, {
        type: ServerEvents.STARTED,
        payload: {
            message: "You are Black"
        }
      });

      this.waitingPlayer = null;
    } else {
      // no one is waiting so this player is the first/white player
      // create a Player and keep it in waitingPlayer
      const whitePlayer: Player = new Player(userDetails.userName, null, wsCon);
      this.waitingPlayer = whitePlayer;
      // send waiting for a opponent event to this player
      this.sendEvent(wsCon, {
        type: ServerEvents.WAITING,
        payload: { message: WAITING_FOR_OPPONENT },
      });
    }
  }

  private sendEvent(wsCon: WebSocket, event: any) {
    event.meta = { from: "server", time: new Date() };
    wsCon.send(JSON.stringify(event));
  }
}
