import { Component, OnInit, Output, Input } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent implements OnInit {
  title: String = 'Error';
  
  @Output() closeModal = new EventEmitter <boolean>();
  @Input() errorData: String;

  constructor() { }

  ngOnInit() {
  }

  onHandleModal() {
    this.closeModal.emit(false);
  }

}
