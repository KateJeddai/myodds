export interface Game {
    _id?: string,
    first_team: string,
    second_team: string,
    firstwin_odds: number,
    secondwin_odds: number,
    draw_odds: number,
    game_date: string,
    game_type: string,
    game_result: {
        winner: string,
        first_team_score: number,
        second_team_score: number
    },
    selectedOdds?: number,
    winner?: string
}
