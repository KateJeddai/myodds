import { Component, OnInit, Input, Renderer2, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { BettingService } from '../betting.service';

@Component({
  selector: 'app-add-result',
  templateUrl: './add-result.component.html',
  styleUrls: ['./add-result.component.scss']
})
export class AddResultComponent implements OnInit, OnChanges {
  @Input() game: any;  
  @Input() gameResults: any;
  form_result: FormGroup;
  editMode = false;
  id: String;
  winner: String;
  isError = false;
  errorData = '';

  constructor(private route: ActivatedRoute,
              private bettingService: BettingService,
              private renderer: Renderer2) { }

  initForm() {
    this.form_result = new FormGroup({
      "winner": new FormControl(null, {validators: [Validators.required]}),
      "first_team_score": new FormControl(null, {validators: Validators.required}),
      "second_team_score": new FormControl(null, {validators: Validators.required})
    })
  } 

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.editMode = params['id'] != null;  
      this.initForm();
    }); 
  }

  ngOnChanges() {    
    this.form_result && this.form_result.get('winner').setValue(this.gameResults.winner);
    this.form_result && this.form_result.get('first_team_score').setValue(this.gameResults.score.first_team_score);
    this.form_result && this.form_result.get('second_team_score').setValue(this.gameResults.score.second_team_score)
  }

  handleSelectColor(event: Event) {
    this.renderer.setStyle(event.target, 'color', '#272727');
  }

  onSubmitGameResult() {
    const winner = this.form_result.value.winner,
          first_team_score = this.form_result.value.first_team_score,
          second_team_score = this.form_result.value.second_team_score;
    const gameData = {
        id: this.id,
        winner,
        first_team_score,
        second_team_score
    };
        this.bettingService.addGameResults(gameData)
            .subscribe((data: any) => {
                console.log(data.data)
                if(data.errors) {
                  this.errorData = data.errors.reduce((tot, err) => {
                    return tot = tot + ' ' + err.message;
                  }, '');
                }
                if(this.errorData.length > 0) {
                  this.isError = true;
                }
                alert('Added results successfully')
                return data; 
            }, (err) => {
                this.isError = false;
                this.errorData = err;                            
            });
  }

  handleCloseModal(event: boolean) {
    this.isError = event;
    !this.isError && (this.errorData = '');
  }

}
