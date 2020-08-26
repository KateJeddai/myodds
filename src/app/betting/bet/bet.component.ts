import { Component, OnInit, Input } from '@angular/core';
import { FullDataBet } from '../bet';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-bet',
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.scss']
})
export class BetComponent implements OnInit {
  @Input() bet: FullDataBet;
  @Input() betType: String;
  faFutbol = faFutbol;  

  constructor() { }

  getOddsForCombinedBet(game, bet) {
    const teams = bet.teams.map(team => team.team);
    let odds;
    teams.forEach(team => {
      if(team === game.first_team ){
        odds = game.firstwin_odds;
      }
      else if(team === game.second_team ){
        odds = game.secondwin_odds;
      }
      else if(team === "Draw"){
        odds = game.draw_odds;
      }
    })
    return odds;
  }

  ngOnInit() {}
}
 