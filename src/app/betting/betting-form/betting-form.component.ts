import { Component, OnInit, OnChanges, OnDestroy, 
         Input, Output, EventEmitter, ElementRef,
         Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { BettingService } from '../betting.service';
import { Game } from '../game';

@Component({
  selector: 'app-betting-form',
  templateUrl: './betting-form.component.html',
  styleUrls: ['./betting-form.component.scss']
})
export class BettingFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedWinner: String;
  @Input() selectedGames: Game[];
  @Input() generalCoef: number;  
  @Input() windowWidth: number; 
  @Output() cancelBet = new EventEmitter<string>();   
  @ViewChild('bettingForm') bettingForm: ElementRef;

  private idSubscription: Subscription;
  private userSubscription: Subscription;
  private gameSubscription: Subscription;
  private bettingSubscription: Subscription;
  private authListenerSub: Subscription;
  private userAuthenticated = false;

  gameId: string;
  betAmount: Number;
  betLimit: Number;
  game: Game;

  private isError = false;
  private errorData = '';
  
  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private bettingService: BettingService,
              private renderer: Renderer2) { }

  ngOnInit() {
    this.userAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService.getAuthStateListener()    
                                           .subscribe(isAuthenticated => {
                                              this.userAuthenticated = isAuthenticated;
                                           });    
    this.getUserBetLimit();                                       
    this.idSubscription = this.route.paramMap
        .subscribe(params => {
            this.gameId = params.get("id");
        });
      
    // if(this.userAuthenticated) {
    //     this.userSubscription = this.authService.getUser()
    //             .subscribe(data => {
    //                 this.betLimit = data.data.user && data.data.user.deposit_limit;
    //             }, (err) => {
    //                 console.log(err);
    //             });
    // }
  }  

  ngOnChanges() {
    let el = this.bettingForm.nativeElement;    
    this.selectedGames.length > 0 && this.renderer.addClass(el, 'display-betform');
    this.selectedGames.length <= 0 && this.renderer.removeClass(el, 'display-betform');
  }
  
  handleLogin() {
    this.router.navigate(['/login']);
  }

  handleRegister() {
    this.router.navigate(['/register']);
  }

  getUserBetLimit() {
      if(this.userAuthenticated) {
        this.userSubscription = this.authService.getUser()
                .subscribe(data => {
                    this.betLimit = data.data.user && data.data.user.deposit_limit;
                }, (err) => {
                    console.log(err);
                });
      }
  }

  onHandleWrongKeys(e: KeyboardEvent) {   
    this.isError = false;
    this.errorData = '';    
     if (e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode < 48 || e.keyCode > 57 && e.keyCode < 96 || e.keyCode > 105) { 
       return false;
     } 
  }

  onSetBetAmount(event: Event) {
    this.isError = false;
    this.errorData = '';
    this.betAmount = +(event.target as HTMLInputElement).value;    
    if(this.ifOverDraw()) {
       this.isError = true;
       this.errorData = `The available amount is $${this.betLimit}. Please, decrease the stake!`;
    } 
    else if(this.ifBetTooSmall()) {
       this.isError = true;
       this.errorData = 'The minimum bet is $5';
    } 
  }  

  ifOverDraw() {
    if(this.betAmount > this.betLimit) {
      return true;
    }
  }

  ifBetTooSmall() {
    if(this.betAmount < 5) {
      return true;
    }   
  }

  onPlaceBet() {
    let betData = [];
    if(!this.betAmount) {
      this.isError = true;
      this.errorData = 'Stake amount field can\'t be empty!';
    }
    else if(this.selectedGames.length <= 0) {
      this.isError = true;
      this.errorData = 'Select a game!';
    }

    let betType = this.selectedGames.length > 1 ? "combinedBets" : "ordinaryBets";
    if(betType === "combinedBets") {
      const teams = this.selectedGames.map(game => {
        return {gameId: game._id, team: game.winner}
      });
      const gameIds = this.selectedGames.map(game => game._id);
      const betData = {
          teams,
          amount: this.betAmount,
          userId: localStorage.getItem('id'),
          gameIds 
      }
      this.betAmount &&  this.bettingService.placeBetCombined(betData).subscribe((res) => {
          if(res && !res.errors) this.clearBetForm();
      });
      
    } else if(betType === "ordinaryBets") {
      const betData = {
          team: this.selectedGames[0].winner,
          amount: this.betAmount,
          userId: localStorage.getItem('id'),
          gameId: this.selectedGames[0]._id
      }
      this.betAmount &&  this.bettingService.placeBet(betData).subscribe((res) => {
          if(res && !res.errors) this.clearBetForm();
      });
    }
  }

  onCancelBet(id: string) {
    this.cancelBet.emit(id);
  }

  clearBetForm() {
    this.isError = false;
    this.errorData = '';
    this.selectedGames.forEach(game => {
      this.onCancelBet(game._id);
    });
    this.betAmount = null;
  }  

  isMobile(): boolean {
    return this.windowWidth >= 900;
  }

  ngOnDestroy() {
      this.idSubscription.unsubscribe();
      this.authListenerSub.unsubscribe();
  }
}
