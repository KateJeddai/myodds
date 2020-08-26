import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  private ifError = false;
  private errorData: String = '';
 
  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    this.ifError = false;
    this.errorData = '';
  }

  initForm() {
      let email = '',
          password = '';
      this.form = new FormGroup({
        'email': new FormControl(email, {validators: [Validators.required]}),
        'password': new FormControl(password, {validators: [Validators.required]})
      });
  }

  onLoginUser() {
      const email = this.form.value.email,
            password = this.form.value.password;
            this.authService.loginUser(email, password)
                .subscribe((data: any) => {
                  if(data.errors && data.errors.length > 0) {
                      this.ifError = true;
                      this.errorData = data.errors.reduce((tot, err) => {
                        return tot = tot + ' ' + err.message;
                      }, '');
                  }
                  else {                           
                      if(localStorage.getItem('token')) {
                         this.router.navigate(['/']); 
                      }   
                  }
                }, (err) => {
                    this.ifError = err;
                    this.errorData = err;
                })                                        
  }

  handleCloseModal(event: boolean) {
      this.ifError = event;
      !this.ifError && (this.errorData = '');
      this.form.get('password').setValue('');
  }
}
