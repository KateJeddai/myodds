import { Game } from './game';

export interface Bet {
    team: String,
    amount: Number,
    userId: String,
    gameId: String,
    betType?: String
}

export interface FullDataBet {
    id?: String,
    team: String,
    amount: Number,
    userId: String,
    game: Game    
}

interface TeamObject {
    gameId: String,
    team: String
}

export interface CombinedBet {
    id?: String,
    teams: TeamObject[],
    amount: Number,
    userId: String,
    gameIds: String[]
}

export interface FullDataCombinedBet {
    id?: String,
    teams: TeamObject[],
    amount: number,
    userId: String,
    games: Game[],
    myProfit?: number
}
