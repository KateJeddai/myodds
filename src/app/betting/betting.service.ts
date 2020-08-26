import { Injectable } from '@angular/core';
import { Game } from './game';
import { Bet, CombinedBet } from './bet';
import { Subject } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { getGames, getGame, addGame, addTeamLogo, editGame, betOnGame, betOnGameCombined, getTeamsLogos } from './graphql';
import { tap } from 'rxjs/operators';

@Injectable()
export class BettingService {
    gamesChanged = new Subject<Game[]>();
    game: Game;

    constructor(private apollo: Apollo) {}  

    getGames() {
        return this.apollo.watchQuery<any>({
            query: getGames
        })
        .valueChanges
    }
    
    getGame(id) {
        return this.apollo.watchQuery<any>({
            query: getGame,
            variables: {
                id
            }
        })
        .valueChanges
    }  

    getTeamsLogos() {
        return this.apollo.watchQuery<any>({
            query: getTeamsLogos
        })
        .valueChanges
    }

    addGame(gameData: Game) {
        return this.apollo.mutate({
            mutation: addGame,
            variables: {
                first_team: gameData.first_team,
                second_team: gameData.second_team,  
                firstwin_odds: gameData.firstwin_odds,
                secondwin_odds: gameData.secondwin_odds,
                draw_odds: gameData.draw_odds,  
                game_date: gameData.game_date,                                          
                game_type: gameData.game_type,

            }
        });    
    }

    addTeamLogo(team_name: String, image: File) {
        return this.apollo.mutate({
            mutation: addTeamLogo,
            variables: {
                file: image,
                team_name: team_name
            },
            context: {
                useMultipart: true
            }
        })
    }

    editGame(gameData: Game, id: String) {
        return this.apollo.mutate({
            mutation: editGame,
            variables: {
                id: id,
                first_team: gameData.first_team,
                second_team: gameData.second_team,  
                firstwin_odds: gameData.firstwin_odds,
                secondwin_odds: gameData.secondwin_odds,
                draw_odds: gameData.draw_odds,  
                game_date: gameData.game_date,                                          
                game_type: gameData.game_type
            }
        }); 
    } 

    addGameResults(gameData: {id: String, winner: String, first_team_score: Number, second_team_score: Number}) {
        return this.apollo.mutate({
            mutation: editGame,
            variables: {
                id: gameData.id,
                winner: gameData.winner,
                first_team_score: gameData.first_team_score,
                second_team_score: gameData.second_team_score
            }
        })
    }

    placeBet(betData: Bet) {
        return this.apollo.mutate({
            mutation: betOnGame,
            variables: {
                team: betData.team,
                amount: betData.amount,
                userId: betData.userId,
                gameId: betData.gameId
            }
        }).pipe(tap((data: any) => {
            console.log(data)
            return data;
        }))
    }

    placeBetCombined(betData: CombinedBet) {
        return this.apollo.mutate({
            mutation: betOnGameCombined,
            variables: {
                teams: betData.teams,
                amount: betData.amount,
                userId: betData.userId,
                gameIds: betData.gameIds
            }
        }).pipe(tap((data: any) => {
            console.log(data)
            return data;
        }))
    }

    formatDate(date) {
        const formattedDate = new Date(+date).toLocaleString();
        return formattedDate;
    } 

}
