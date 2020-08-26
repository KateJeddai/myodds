import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restore-pass',
  templateUrl: './restore-pass.component.html',
  styleUrls: ['./restore-pass.component.scss']
})
export class RestorePassComponent implements OnInit, OnDestroy {
  private requestPasswordUpdate = false;
  private ifError = false;
  private errorData: String = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }
  
  onSubmitRestorePass(form: NgForm) {
    const email = form.value.email;
    this.authService.restorePassword(email)
        .subscribe(data => {
          if(data.data.restorePasswordRequest && data.data.restorePasswordRequest._id && !data.errors) {
            this.requestPasswordUpdate = true;
          } else if(data.errors) {
              this.errorData = data.errors.reduce((tot, err) => {
                  return tot = tot + ' ' + err.message;
              }, '');
            }
            if(this.errorData.length > 0) {
              this.ifError = true;
            }
        },(error) => {
           this.ifError = true;
           this.errorData = error;
        });
  }

  ngOnDestroy() {
    this.requestPasswordUpdate = false;
    this.ifError = false;
    this.errorData = '';
  } 
  
  handleCloseModal(event: boolean) {
    this.ifError = event;
    !this.ifError && (this.errorData = '');
  }

}
