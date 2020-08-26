import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {
  private errorData = '';
  private isError = false;
  private token = '';

  constructor(private authService: AuthService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.getQueryParams()
  }

  getQueryParams() {
    this.route.queryParams
        .subscribe((params: Params) => {
            this.token = params.token;
    })
  }

  onSubmitNewPass(form: NgForm) {
    const newPass = form.value.password,
          confirmPass = form.value.confirm_password;
          if(newPass !== confirmPass) {
              this.isError = true;
              this.errorData = 'Passwords don\'t match';
              form.resetForm();
          } 
          this.authService.updatePassword(newPass, this.token)
              .subscribe(data => {
                  console.log(data)
              });
  }

  handleCloseModal(event: boolean) {
    this.isError = false;
    this.errorData = '';
  }

}
