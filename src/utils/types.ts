import { WebSocket } from "ws"
import { v4 as uuidv4 } from 'uuid';

export interface InItEvent {
    type: string
}

export interface Game {
    whitePlayer: Player,
    whitePlayersTimeRemaining: string

    blackPlayer: Player
    blackPlayersTimeRemaining: string

    isWhitesTurn: boolean
}

export class Player {
    userId: string
    userName: string
    userDetails: UserDetails | null
    userWs: WebSocket

    constructor(userName: string, userDetails: UserDetails | null, userWs: WebSocket) {
        this.userId = uuidv4().toString()
        this.userName = userName
        this.userDetails = userDetails
        this.userWs = userWs
    }
}

export interface UserDetails {

}

export interface ClientEvent {
    type: ClientEvents.INIT | ClientEvents.MOVE,
    meta: {
        from: 'client' | null, 
        time: Date
    },
    payload: any
}

export interface ServerEvent {
    type: ServerEvents.WAITING | ClientEvents.MOVE,
    meta: {
        from: 'server' | null, 
        time: Date
    },
    payload: any
}

export enum ClientEvents {
    INIT = "init-game",
    MOVE = "piece-move",
    South = "",
    West = ""
}

export enum ServerEvents {
    WAITING = "waiting-for-opponent",
    MOVE = "piece-move",
    South = "",
    West = ""
}

export const WAITING_FOR_OPPONENT = "Waiting for an opponent to join"