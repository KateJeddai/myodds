import { Component, OnInit, OnDestroy, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { fromEvent, Observable, Subscription, combineLatest } from 'rxjs';
import {map} from 'rxjs/operators';
import { Game } from  './game';
import { Logo } from  './logo';
import { BettingService } from './betting.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-betting-chart',
  templateUrl: './betting-chart.component.html',
  styleUrls: ['./betting-chart.component.scss']
})

export class BettingChartComponent implements OnInit, OnDestroy {
  @ViewChild('bettingForm') bettingForm: ElementRef;
  private isAuthenticated = false;
  private isAdmin = false;
  private authListenerSub: Subscription;
  private adminListenerSub: Subscription;

  private games: Game[];  
  private leagues: {};
  private leaguesNames: any[];
  private logos: Logo[];

  private querySubscription: Subscription;
  private selectedWinner: String;
  private selectedGames: Game[] = [];
  private generalCoef: Number;

  private resizeObservable$: Observable<Event>;
  private resizeSubscription$: Subscription;
  private windowWidth: number;  

  constructor(private bettingService: BettingService,
              private authService: AuthService,
              private location: Location,
              private router: Router,
              private renderer: Renderer2,
              private elem: ElementRef) {}

  ngOnInit() {
      this.getGamesData();
      this.getTeamsLogos();
      this.windowWidth = window.innerWidth;
      
      this.isAdmin = this.authService.getIfAdmin();
      this.isAuthenticated = this.authService.getIsAuth();
      this.isAuthenticated && this.getUserBetsData();
                                                       
      this.authListenerSub = this.authService.getAuthStateListener()    
                                             .subscribe(isAuthenticated => {
                                                  this.isAuthenticated = isAuthenticated;
                                             });
      this.adminListenerSub = this.authService.getAdminStateListener()    
                                              .subscribe(isAdmin => {
                                                  this.isAdmin = isAdmin;
                                              });
      if(localStorage.getItem('selectedGames')) {
          this.selectedGames = JSON.parse(localStorage.getItem('selectedGames'));  
          this.generalCoef = this.countGeneralCoef(this.selectedGames); 
      } 
      this.getWindowWidth();
  }

  getWindowWidth() {
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription$ = this.resizeObservable$.subscribe(e => {
      this.windowWidth = window.innerWidth;
    })
  } 

  attachRemoveClassNameToSelectedGames(game, typeOfAct) {
    const gameId = game._id;
    const elements = this.elem.nativeElement.querySelectorAll('.odds-td');
    const elementsArray = Array.from(elements);
          elementsArray.forEach((el: {className: String, innerText: String}) => {
            if(typeOfAct === 'attach') {
              if(el.className.includes(gameId) && +el.innerText === game.selectedOdds) {
                this.renderer.addClass(el, 'odds-clicked');
              }
            } else if(typeOfAct === 'remove') {
              if(el.className.includes(gameId) && +el.innerText === game.selectedOdds) {
                this.renderer.removeClass(el, 'odds-clicked');
              }
            }        
          })
          localStorage.removeItem('selectedGames');        
  }

  classifyGamesByLeague(games) {
      const leagues = games && games.length > 0 && games.reduce((acc, game) => { 
          if(acc[game.game_type]) {
            acc[game.game_type].push(game);
          } else {
            acc[game.game_type] = [];
            acc[game.game_type].push(game);
          }
          return acc;
      }, {});
      return leagues;
  }

  getLeaguesNames(games) {
      const names = games && games.length > 0 && games.map(game => game.game_type);
      const leaguesNames = [];
      names && names.length > 0 && names.forEach(name => {
        if(leaguesNames.indexOf(name) >= 0) {
          return;
        } else {
          leaguesNames.push(name);
        }
      })
      return leaguesNames;
  }

  getGamesData () {
    this.querySubscription = this.bettingService.getGames()
                                 .pipe(
                                  map(({data}) => {
                                      const gamesTransformed = data.games.map(game => {
                                         return {...game, game_date: this.bettingService.formatDate(game.game_date)};
                                      });
                                      return {data: gamesTransformed};
                                 })) 
        .subscribe(( {data} ) => {
            this.games = data;
            this.leagues = this.classifyGamesByLeague(this.games);
            this.leaguesNames = this.getLeaguesNames(this.games);
        });
  }

  getTeamsLogos() {
    this.bettingService.getTeamsLogos()
        .pipe(map((data) => {
           const logosTransformed = data.data.logos.map(logo => {
               return {[logo.team_name]: logo.logo.path};
           })
           return {data: logosTransformed};
        })) 
        .subscribe((data: any) => {
           this.logos = data.data;
        }, (err) => {
           console.log(err);
        })
  }

  findImagePath(team_name: string) {
    let url = '';
    if(this.logos && this.logos.length > 0) {
      for(let i = 0; i <= this.logos.length; i++) {
        if(this.logos[i] && this.logos[i][team_name]) {
           url = this.logos[i][team_name];    
           return url;       
        } 
      }
    } 
  }

  getUserBetsData() {
    const betGamesIds = [];
    let combinedBetsGamesIds = [],
        ordinaryBetsGamesIds = [];
    const joinedBets = combineLatest(
          this.authService.getUserCombinedBets(),
          this.authService.getUserOrdinaryBets());
    joinedBets.subscribe(([combinedBets, ordinaryBets]) => {
        let combBets = combinedBets.data.combinedBets;
          if(combBets && combBets.length > 0) {
              const gamesArr = combBets.map(bet => bet.games);
              const newGamesArr = gamesArr.reduce((tot = [], item) => {
                return tot = tot.concat(item);
              })
              combinedBetsGamesIds = newGamesArr.map(item => item._id);          
              combinedBetsGamesIds.forEach(id => {
                if(betGamesIds.indexOf(id) < 0) {
                  betGamesIds.push(id);
                }
              }) 
          }
        let ordBets = ordinaryBets.data.ordinaryBets; 
          if(ordBets && ordBets.length > 0) {
             ordinaryBetsGamesIds = ordBets.map(bet => bet.game._id);
             ordinaryBetsGamesIds.forEach(id => {
                if(betGamesIds.indexOf(id) < 0) {
                   betGamesIds.push(id);
                }
             })
          }
        this.pointGamesUserBettedOn(this.games, betGamesIds);  
        }, (err) => {
          console.log(err);
        });
  }
  
  pointGamesUserBettedOn(games, betsIds) {
    this.games = this.games && this.games.length > 0 && this.games.map(game => {
      return {
        ...game,
        betted: this.checkIfUserBettedOnGame(game._id, betsIds)
      }
    })
    this.leagues = this.classifyGamesByLeague(this.games);
    this.leaguesNames = this.getLeaguesNames(this.games);
  }
  
  checkIfUserBettedOnGame(gameId, betsIds) {
    return betsIds.indexOf(gameId) >= 0;
  }

  ifGameSelected(id) {
    return this.selectedGames.map(game => game._id).indexOf(id);
  }

  handleBetTicket(selected: string, game: Game, event: Event) {
      let element = event.target as HTMLInputElement;
      let elClassName = element.className;
      let elements = this.elem.nativeElement.querySelectorAll(`.g${game._id}`);
      localStorage.removeItem('selectedGames');

      if(this.selectedGames.length <= 0) {
         this.selectedWinner = selected;
         const gameWithOdds = this.addOddsToSelectedGame(game);
         this.selectedGames.push(gameWithOdds);
         
      } else if(this.selectedGames.length > 0) {
          if(elClassName.includes('odds-clicked')) {            
             this.selectedWinner = '';
             this.onCancelBet(game._id);
          } else {
              if(this.selectedGames.map(item => item._id).indexOf(game._id) >= 0) {
                 this.onCancelBet(game._id);
                 this.selectedWinner = selected;
                 const gameWithOdds = this.addOddsToSelectedGame(game);
                 this.selectedGames.push(gameWithOdds);
              } else {
                 this.selectedWinner = selected;
                 const gameWithOdds = this.addOddsToSelectedGame(game);
                 this.selectedGames.push(gameWithOdds);
              }
          }
      }
      this.generalCoef = this.countGeneralCoef(this.selectedGames);
      this.selectedGames.length > 0 && 
      this.selectedGames.forEach((sel) => this.attachRemoveClassNameToSelectedGames(sel, 'attach'));      
  }

  countGeneralCoef(gamesArray: Game[]) {
      let total;
      total = gamesArray.reduce((tot: number, item: Game) => {
          return tot = tot + item.selectedOdds;
      }, 0);
      return total.toFixed(2);
  }

  addOddsToSelectedGame(game) {
      switch(this.selectedWinner) {
        case "first_team":
          return {
            ...game,
            selectedOdds: game.firstwin_odds,
            winner: game.first_team
          }
        case "second_team"  :
          return {
            ...game,
            selectedOdds: game.secondwin_odds,
            winner: game.second_team
          }
        case "Draw":
          return {
            ...game,
            selectedOdds: game.draw_odds,
            winner: "Draw"
          }
        default: return;  
      }
  }

  onCancelBet(id: string) {
    const gamesToKeep = this.selectedGames.filter(item => item._id !== id);
    const gamesToDelete = this.selectedGames.filter(item => item._id === id);
    this.selectedGames = [...gamesToKeep];
    gamesToDelete.forEach((sel) => this.attachRemoveClassNameToSelectedGames(sel, 'remove')); 
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.resizeSubscription$.unsubscribe();
    if(this.selectedGames.length > 0) {
      localStorage.setItem('selectedGames', JSON.stringify(this.selectedGames));
  }
}

}


