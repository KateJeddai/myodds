import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-bet-paginator',
  templateUrl: './bet-paginator.component.html',
  styleUrls: ['./bet-paginator.component.scss']
})
export class BetPaginatorComponent implements OnInit {
  @Output() pageChanged = new EventEmitter();
  @Input() length;
  currentPage: number = 1;  
  pageSize: number = 4;
  pageSizeOptions = [2, 4, 6, 8];

  constructor() { }

  ngOnInit() {    
  }

  onChangePage(pageData: PageEvent) {
    this.pageSize = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.pageChanged.emit({pageSize: this.pageSize, currentPage: this.currentPage});
  }  

}
