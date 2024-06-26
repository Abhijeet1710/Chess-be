import { v4 as uuidv4 } from 'uuid';
import { Player } from '../utils/types';
import { Chess } from 'chess.js';


export class Game {
    gameId: string
    private whitePlayer: Player
    private whitePlayerTimer: string
    private blackPlayer: Player
    private blackPlayerTimer: string
    private board: Chess

    constructor(whitePlayer: Player, blackPlayer: Player) {
        this.gameId = uuidv4().toString()
        this.whitePlayer = whitePlayer
        this.blackPlayer = blackPlayer
        this.whitePlayerTimer = new Date().toString()
        this.blackPlayerTimer = new Date().toString()
        this.board = new Chess()
    }

    getWhitePlayer() {
        return this.whitePlayer
    }
    
    getBlackPlayer() {
        return this.blackPlayer
    }

    getBoard() {
        return this.board
    }

    movePiece(move: {from: string, to: string, promotion: string | undefined}): {success: boolean, message: string, fen: string, move: {from: string, to: string} | null} {
        try {
            console.log("Received Move", move);
            
            this.board.move(move)
            return {success: true, move, message: "Valid Move", fen: this.board.fen()}
        }catch(er) { }

        return {success: false, move: null, message: "Invalid Move", fen: this.board.fen()}
    }

}