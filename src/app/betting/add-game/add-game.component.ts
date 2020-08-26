import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '../game';
import { BettingService } from '../betting.service';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})

export class AddGameComponent implements OnInit, OnDestroy {
  form: FormGroup;
  editMode = false;
  id: String;
  private querySubscription: Subscription;
  private authListenerSub: Subscription;
  userAdmin = false;
  loading: boolean;
  game: Game;
  results: any;
  disableSubmit = true;
  isError = false;
  errorData = '';
  updateSuccess = false;
  
  constructor(private route: ActivatedRoute,
              private router: Router,
              private bettingService: BettingService,
              private authService: AuthService) {}

  initForm() {
    let first_team = this.editMode && this.game ? this.game.first_team : '',
        second_team = this.editMode && this.game ? this.game.second_team : '',
        firstwin_odds = this.editMode && this.game ? this.game.firstwin_odds : null,
        secondwin_odds = this.editMode && this.game ? this.game.secondwin_odds : null,
        draw_odds = this.editMode && this.game ? this.game.draw_odds : null,
        game_date = this.editMode && this.game ? this.transformDate(+this.game.game_date) : this.transformDate(new Date().getTime()),
        game_time = this.editMode && this.game ? this.transformTime(+this.game.game_date) : this.transformTime(new Date().getTime()),
        game_type = this.editMode && this.game ? this.game.game_type : '';

    this.form = new FormGroup({
      'first_team': new FormControl(first_team, {validators: [Validators.required]}),
      'second_team': new FormControl(second_team, {validators: [Validators.required]}),
      'firstwin_odds': new FormControl(firstwin_odds, {validators: [Validators.required]}),
      'secondwin_odds': new FormControl(secondwin_odds, {validators: [Validators.required]}),
      'draw_odds': new FormControl(draw_odds, {validators: [Validators.required]}),
      'game_date': new FormControl(game_date, {validators: [Validators.required]}),
      'game_time': new FormControl(game_time, {validators: [Validators.required]}),
      'game_type': new FormControl(game_type, {validators: [Validators.required]})
    });
  }

  transformDate(dateMs) {
    const game_dateMs = new Date(dateMs);
    const year = game_dateMs.getFullYear(),
          month = game_dateMs.getMonth() + 1 < 10 ? '0' + (game_dateMs.getMonth() + 1) : game_dateMs.getMonth() + 1,
          date = game_dateMs.getDate() < 10 ? '0' + game_dateMs.getDate() : game_dateMs.getDate();
    const game_date = `${year}-${month}-${date}`;
    return game_date;
  }

  transformTime(dateMs) {
    const game_dateMs = new Date(dateMs);
    const hours = game_dateMs.getHours() < 10 ? '0' + game_dateMs.getHours() : game_dateMs.getHours(),
          mins = game_dateMs.getMinutes() < 10 ? '0' + game_dateMs.getMinutes() : game_dateMs.getMinutes();
    const game_time = `${hours}:${mins}`;
    return game_time;
  }

  ngOnInit() {
    this.getParams();
    this.initForm();
    this.userAdmin = this.authService.getIfAdmin();
    this.authListenerSub = this.authService.getAuthStateListener()    
                                           .subscribe(isAuthenticated => {
                                                this.userAdmin = isAuthenticated;                                                
                                            })                                          
    this.userAdmin && this.editMode && this.bettingService.getGame(this.id)
          .subscribe(({data, loading}) => {
            this.game = data.game;  
            this.results = data.game.game_result ? data.game.game_result : null;
            this.loading = loading;
            this.initForm();
      });
    !this.userAdmin && this.router.navigate(['/login']);
  }

  getParams() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.editMode = params['id'] != null; 
    }); 
  }

   ngOnDestroy() {
      this.isError = false;
      this.errorData = '';
      this.updateSuccess = false;
   }  
 
  onSubmitGame() {
    const first_team = this.form.value.first_team,
          second_team = this.form.value.second_team,
          firstwin_odds = +this.form.value.firstwin_odds,
          secondwin_odds = +this.form.value.secondwin_odds,
          draw_odds = +this.form.value.draw_odds,
          game_date = "" + new Date(this.form.value.game_date).getTime(),
          game_time = this.form.value.game_time,
          game_type = this.form.value.game_type;
    
    if(!first_team || !second_team  || !firstwin_odds || !secondwin_odds ||
       !draw_odds || !game_date  || !game_time || !game_type) {
            this.isError = true;
            this.errorData = "Fields can't be empty!"; 
    }   
    
    else {
        const time = "" + new Date(this.form.value.game_date + " " + game_time).getTime();      
        const game = {first_team, second_team, firstwin_odds, secondwin_odds,
                      draw_odds, game_date: time, game_type,
                      game_result: {winner: '', first_team_score: null, second_team_score: null}};

        !this.editMode && this.bettingService.addGame(game)
            .subscribe(( data: any ) => {
                console.log('added data', data);
                if(data.data.addGame && data.data.addGame._id) {
                  this.updateSuccess = true;
                }
            },(error) => {
                this.updateSuccess = false;
                this.isError = true;
                this.errorData = error;
            });

        this.editMode && this.bettingService.editGame(game, this.id) 
            .subscribe(({ data }) => {
                console.log('edited data', data);
                this.updateSuccess = true;
            },(error) => {
                this.updateSuccess = false;
                this.isError = true;
                this.errorData = error;
            });  
    }
  }

  handleReloadEdit() {
    this.updateSuccess = false;
  }

  handleCloseModal(event: boolean) {
      this.isError = event;
      !this.isError && (this.errorData = '');
  }
}
