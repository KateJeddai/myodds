import { Injectable } from '@angular/core';
// import { Subject, Observable } from 'rxjs';

@Injectable()
export class BetsService {
   /* private activeBets = new Subject<any>();  
    private archivedBets = new Subject<any>();
    
    showActiveBets(): Observable<any> {
        return this.activeBets.asObservable();
    }

    showArchivedBets(): Observable<any> {
        return this.archivedBets.asObservable();
    }
  
    updateActiveBets(bool) {
        this.activeBets.next(bool);
    }

    updateArchivedBets(bool) {
        this.archivedBets.next(bool);
    }*/

    constructor() {}  

    countProfitOrdinary(bet) {
        const myWinner = bet.team,
              game = bet.game;
        let odds;
        if(myWinner === game.first_team) {
          odds = game.firstwin_odds;
        } else if(myWinner === game.second_team) {
          odds = game.secondwin_odds;
        }
        else if(myWinner === "Draw") {
          odds = game.draw_odds;
        }
        const profit = (bet.amount * odds - bet.amount).toFixed(2);
        const fullAmount = bet.amount * odds;
        return {odds, profit, fullAmount};
    }

    countProfitCombined(bet) {
        const { games, amount, teams } = bet;
        let potentialProfit;
            const gamesOdds = games.map(game => {
                let odds;
                teams.forEach(team => {
                    if(team.gameId === game._id) {
                        if(team.team === game.first_team) {
                            odds = game.firstwin_odds;
                        }
                        else if(team.team === game.second_team) {
                            odds = game.secondwin_odds;
                        }
                        else if(team.team === "Draw") {
                            odds = game.draw_odds;
                        }
                    }
                })
                return odds;
            })
        const generalCoef = gamesOdds.reduce((tot, odd) => {
            tot = tot + odd;
            return tot;
        }, 0);
        potentialProfit = amount * generalCoef - amount;
        return potentialProfit;
    }

    checkIfBetActual(bet) {
        let ifActual;
        const now = new Date().getTime();            
        if(bet.game) {
            const gameDate = new Date(bet.game.game_date).getTime();
                  ifActual = gameDate > now;
        } else if(bet.games && bet.games.length > 1) {
            const activeGames = bet.games.filter(game => new Date(game.game_date).getTime() > now);
            const archivedGames = bet.games.filter(game => new Date(game.game_date).getTime() < now);
            const lostGames = archivedGames.filter(game => game.game_result.winner !== bet.team);
            if(activeGames.length > 0 && lostGames.length === 0) {
                  ifActual = true;
            }
        }        
        return ifActual; 
    }

    checkIfBetExpired(bet) {
        let ifArchived;
        const now = new Date().getTime();            
        if(bet.game) {
            let gameDate;
            gameDate = this.changeDotsToSlashes(bet.game.game_date);
            gameDate = new Date(gameDate).getTime();
            ifArchived = gameDate < now;
            
        } else if(bet.games && bet.games.length > 1) {
            const archivedGames = bet.games.filter(game => {
                let gameDate = this.changeDotsToSlashes(game.game_date);
                    gameDate = new Date(gameDate).getTime();
                return new Date(gameDate).getTime() < now;
            })
            const lostGames = archivedGames.filter(game => {
                for(let i = 0; i < bet.teams.length; i++) {
                    if(bet.teams[i].gameId === game._id) {
                        if(game.game_result && bet.teams[i].team !== game.game_result.winner) {
                            return game;
                        }
                    }
                }             
            })
            if(archivedGames.length === bet.games.length || lostGames.length > 0) {
                ifArchived = true;
            }
        }        
        return ifArchived; 
    }

    checkIfDotsInDate(str) {
        return str.includes('.');
    }

    changeDotsToSlashes(str) {
        let newStr;
        if(this.checkIfDotsInDate(str)) {
            const regex = /[.]/g;
            newStr = str.replace(regex, '/');
            const data = newStr.split(',')[0].split('/');
            const time = newStr.split(',')[1];
            [data[0],data[1]] = [data[1],data[0]];
            newStr = data.join('/').concat(time);
            return newStr;
        } else return str;
    }

    checkIfCombinedBetWon(bet) {
        const {games, teams} = bet;
        const gamesWon = games.filter(game => {
            for(let i = 0; i < teams.length; i++) {
                if(teams[i].gameId === game._id) {
                    if(teams[i].team === game.game_result.winner) {
                        return game;
                    }
                }
            } 
        })
        if(gamesWon.length === games.length) {
            return true;
        } else return false;
    }

    checkIfOrdinaryBetWon(bet) {
        if(bet.game.game_result.winner === bet.team) {
            return true;
        } else return false;
    }

    countAmountWonLostOrdinary(bet) {    
        let win;
        if(bet.game && bet.game.game_result) {
            if(bet.game.game_result.winner === bet.team) {
              win = bet.amount * bet.myProfit.odds - bet.amount
            } else {
              win = bet.amount * -1;
            } 
        } 
        return win;
    }    
}
