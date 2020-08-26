import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BetsService } from '../bets.service';
import { Subscription } from 'rxjs';
import { FullDataBet, FullDataCombinedBet } from '../bet';
import { AuthService } from 'src/app/auth/auth.service';
import { BettingService } from '../betting.service';
import { ActivatedRoute, Params } from '@angular/router';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-bets-list',
  templateUrl: './bets-list.component.html',
  styleUrls: ['./bets-list.component.scss']
})
export class BetsListComponent implements OnInit, OnDestroy  {
  private isAuthenticated = false;
  private authListenerSub: Subscription; 
  private showActiveBets: boolean = false;
  private showArchivedBets: boolean = false;

  private activeOrdinaryBets: FullDataBet[];
  private archivedOrdinaryBetsWon: FullDataBet[];
  private archivedOrdinaryBetsLost: FullDataBet[];
  private activeCombinedBets: FullDataCombinedBet[];
  private archivedCombinedBetsWon: FullDataCombinedBet[];
  private archivedCombinedBetsLost: FullDataCombinedBet[];
  noLimit = false;

  showAllOrdWon = false;
  showAllCombWon = false;
  showAllOrdLost = false;
  showAllCombLost = false;

  @ViewChild('paginator_ordwon') paginator_ordwon: MatPaginator;
  @ViewChild('paginator_ordlost') paginator_ordlost: MatPaginator;
  @ViewChild('paginator_combwon') paginator_combwon: MatPaginator;
  @ViewChild('paginator_comblost') paginator_comblost: MatPaginator;
  private currentPage: number = 1;
  private length: number;
  private pageSize: number = 4;

  constructor(private betsService: BetsService, private bettingService: BettingService,
              private authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit() {    
      this.isAuthenticated = this.authService.getIsAuth();
      this.authListenerSub = this.authService.getAuthStateListener()    
                                              .subscribe(isAuthenticated => {
                                                    this.isAuthenticated = isAuthenticated;
                            });                                               
      this.getQueryParams();
  }
  
  getActiveOrdBets() {
      this.authService.getUserOrdinaryBets()
        .subscribe(data => {
            this.activeOrdinaryBets = data.data.ordinaryBets && data.data.ordinaryBets.length > 0 &&
                                      data.data.ordinaryBets.map((bet: FullDataBet) => {
                                          return {
                                                ...bet,
                                                myProfit: this.betsService.countProfitOrdinary(bet),
                                                game: {
                                                  ...bet.game,
                                                  game_date: this.bettingService.formatDate(bet.game.game_date)
                                              }
                                          }
                                      });        
          }) 
  }

  getActiveCombBets() {
      this.authService.getUserCombinedBets()
        .subscribe((data) => {
            this.activeCombinedBets = data.data.combinedBets && data.data.combinedBets.length > 0 &&
                                      data.data.combinedBets.map((bet) => {
                                          return {
                                              ...bet,
                                              myProfit: this.betsService.countProfitCombined(bet),
                                              games: this.formatDateCombinedBetGames(bet.games)
                                          }
                                      });  
            })       
  }

  getArchivedOrdWonBets(pageSize, currentPage) {
    this.authService.getUserOrdinaryBetsWon(pageSize, currentPage)
        .pipe(map((data => {
              const archivedOrdinaryBetsWon = data.data.ordinaryBetsWon && data.data.ordinaryBetsWon.length > 0 &&
                    data.data.ordinaryBetsWon.map(bet => {
                        return {
                          ...bet,
                          myProfit: this.betsService.countProfitOrdinary(bet)
                        }
                    });
                    return archivedOrdinaryBetsWon;
        })))
        .subscribe((data) => {
            this.archivedOrdinaryBetsWon = data && data.map(bet => {
                return {
                    ...bet,
                    myProfit: this.betsService.countProfitOrdinary(bet),
                    myWin: this.betsService.countAmountWonLostOrdinary(bet),
                    game: {
                      ...bet.game,
                      game_date: this.bettingService.formatDate(bet.game.game_date)
                    }
                }
            });              
        }) 
  }

  getArchivedOrdLostBets(pageSize, currentPage) {
    this.authService.getUserOrdinaryBetsLost(pageSize, currentPage)
        .pipe(map((data => {                
            const archivedOrdinaryBetsLost = data.data.ordinaryBetsLost && data.data.ordinaryBetsLost.length > 0 &&
                  data.data.ordinaryBetsLost.map(bet => {
                      return {
                          ...bet,
                          myProfit: this.betsService.countProfitOrdinary(bet)
                      }
                  }); 
                  return archivedOrdinaryBetsLost;
        })))
        .subscribe((data) => {
            this.archivedOrdinaryBetsLost = data && data.map(bet => {
                return {
                    ...bet,
                    myProfit: this.betsService.countProfitOrdinary(bet),
                    myWin: this.betsService.countAmountWonLostOrdinary(bet),
                    game: {
                      ...bet.game,
                      game_date: this.bettingService.formatDate(bet.game.game_date)
                    }
                }
            }); 
        }) 
  }

  getArchivedCombWonBets(pageSize, currentPage) {
    this.authService.getUserCombinedBetsWon(pageSize, currentPage) 
        .pipe(map((data) => {
            const archivedCombinedBetsWon = data.data.combinedBetsWon && data.data.combinedBetsWon.length > 0 &&
                  data.data.combinedBetsWon.map(bet => {
                    return {
                      ...bet,
                      myProfit: this.betsService.countProfitCombined(bet)
                    }
                  });
                  return archivedCombinedBetsWon;
        }))
        .subscribe(data => {
            this.archivedCombinedBetsWon = data && data.map(bet => {
                                                return {
                                                    ...bet,
                                                    myWin: bet.myProfit,
                                                    fullWin: bet.myProfit + bet.amount,
                                                    games: this.formatDateCombinedBetGames(bet.games)
                                                }
            });    
        })
  }

  getArchivedCombLostBets(pageSize, currentPage) {
    this.authService.getUserCombinedBetsLost(pageSize, currentPage) 
        .pipe(map((data) => {
            const archivedCombinedBetsLost = data.data.combinedBetsLost && data.data.combinedBetsLost.length > 0 &&
                  data.data.combinedBetsLost.map(bet => {
                    return {
                      ...bet,
                      myProfit: this.betsService.countProfitCombined(bet)
                    }
                  });
                  return archivedCombinedBetsLost;
        })) 
        .subscribe(data => {
            this.archivedCombinedBetsLost = data && data.map(bet => {
                                                return {
                                                    ...bet,
                                                    myWin: bet.myProfit,
                                                    fullWin: bet.myProfit + bet.amount,
                                                    games: this.formatDateCombinedBetGames(bet.games)
                                                }
            });
        })
  }

  showAllArchived(betType: string) {
    switch(betType) {
      case "ordinary won":
          this.showAllOrdWon = !this.showAllOrdWon;
          this.showAllOrdWon && this.getArchivedOrdWonBets(0, 0);
          !this.showAllOrdWon && this.getArchivedOrdWonBets(this.pageSize, this.currentPage);
          break;
      case "ordinary lost":
          this.showAllOrdLost = !this.showAllOrdLost;
          this.showAllOrdLost && this.getArchivedOrdLostBets(0, 0);
          !this.showAllOrdLost && this.getArchivedOrdLostBets(this.pageSize, this.currentPage);
          break;
      case "combined won":
          this.showAllCombWon = !this.showAllCombWon;
          this.showAllCombWon && this.getArchivedCombWonBets(0, 0);
          !this.showAllCombWon && this.getArchivedCombWonBets(this.pageSize, this.currentPage);
          break;
      case "combined lost":
          this.showAllCombLost = !this.showAllCombLost;
          this.showAllCombLost && this.getArchivedCombLostBets(0, 0);
          !this.showAllCombLost && this.getArchivedCombLostBets(this.pageSize, this.currentPage);
          break;
      default: return;    
    }
  }

  ifActiveBets() {
    if(this.activeOrdinaryBets && this.activeOrdinaryBets.length > 0 ||
       this.activeCombinedBets && this.activeCombinedBets.length > 0) {
            return true;
       }
  }

  ifArchivedBets() {
    if(this.archivedOrdinaryBetsWon && this.archivedOrdinaryBetsWon.length > 0 ||
       this.archivedOrdinaryBetsLost && this.archivedOrdinaryBetsLost.length > 0 || 
       this.archivedCombinedBetsWon && this.archivedCombinedBetsWon.length > 0 ||
       this.archivedCombinedBetsLost && this.archivedCombinedBetsLost.length > 0) {
            return true;
       }
  }

  ifBetsWon() {
    if(this.archivedOrdinaryBetsWon && this.archivedOrdinaryBetsWon.length > 0 || 
       this.archivedCombinedBetsWon && this.archivedCombinedBetsWon.length > 0) {
            return true;
       }
  }

  ifBetsLost() {
    if(this.archivedOrdinaryBetsLost && this.archivedOrdinaryBetsLost.length > 0 || 
       this.archivedCombinedBetsLost && this.archivedCombinedBetsLost.length > 0) {
           return true;
       }
  }

  onChangePage(paginatorData, paginatorType) {
     this.pageSize = paginatorData.pageSize,
     this.currentPage = paginatorData.currentPage;
     switch(paginatorType) {
        case "paginator_ordwon":          
            this.getArchivedOrdWonBets(this.pageSize, this.currentPage);
            break;
        case "paginator_ordlost":
            this.getArchivedOrdLostBets(this.pageSize, this.currentPage);
            break;
        case "paginator_combwon":                 
            this.getArchivedCombWonBets(this.pageSize, this.currentPage);
            break;
        case "paginator_comblost":
            this.getArchivedCombLostBets(this.pageSize, this.currentPage);
            break;
        default: return;  
    }
  }

  setPaginatorsLength(paginatorType: string) {
    const ordwon_length = JSON.parse(localStorage.getItem('betsCount')).ordBetsWon;
    const ordlost_length = JSON.parse(localStorage.getItem('betsCount')).ordBetsLost;
    const combwon_length = JSON.parse(localStorage.getItem('betsCount')).combBetsWon;
    const comblost_length = JSON.parse(localStorage.getItem('betsCount')).combBetsLost;
    switch(paginatorType) {
        case "paginator_ordwon":
          return ordwon_length;
        case "paginator_ordlost":
          return ordlost_length;  
        case "paginator_combwon":
          return combwon_length;
        case "paginator_comblost":
          return comblost_length;
        default: return 100;  
    }
  }
  
  formatDateCombinedBetGames(games) {
      return games.map(game => {
        return {
          ...game,
          game_date: this.bettingService.formatDate(game.game_date) 
        }
      })
  }

  getQueryParams() {
    this.route.queryParams
        .subscribe((params: Params ) => {
            params.betType === "active" && (this.showActiveBets = true) && (this.showArchivedBets = false);
            params.betType === "archived" && (this.showArchivedBets = true) && (this.showActiveBets = false);
            if(this.showActiveBets) {
              this.getActiveOrdBets(); 
              this.getActiveCombBets(); 
            } 
            if(this.showArchivedBets && this.pageSize && this.currentPage) {
              this.getArchivedOrdWonBets(this.pageSize, this.currentPage);
              this.getArchivedOrdLostBets(this.pageSize, this.currentPage); 
              this.getArchivedCombWonBets(this.pageSize, this.currentPage);
              this.getArchivedCombLostBets(this.pageSize, this.currentPage);
            }
        });
  }

  ngOnDestroy() {
    this.authListenerSub.unsubscribe();
  }

}
