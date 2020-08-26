import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  private yearNow: number;
  constructor() { }

  ngOnInit() {
    this.findYearNow();
  }

  findYearNow() {
    this.yearNow = new Date().getFullYear();
  }

}
