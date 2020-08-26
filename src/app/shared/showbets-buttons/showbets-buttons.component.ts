import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-showbets-buttons',
  templateUrl: './showbets-buttons.component.html',
  styleUrls: ['./showbets-buttons.component.scss']
})
export class ShowbetsButtonsComponent implements OnInit {
  userId: String = localStorage.getItem('id');
  @Input() showActiveBetsButton;
  @Input() showArchivedBetsButton;

  constructor(private router: Router) { }

  ngOnInit() { }

  handleShowActiveBets() {    
    this.router.navigate([`/betting/bets-list/${this.userId}`], {queryParams: { betType: "active"}});      
  }

  handleShowArchivedBets() {
      this.router.navigate([`/betting/bets-list/${this.userId}`], {queryParams: { betType: "archived"}});
  }
  
}
