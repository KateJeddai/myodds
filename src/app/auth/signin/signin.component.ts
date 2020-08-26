import { Component, OnInit, OnDestroy, Renderer2, ElementRef, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from '../user';
import { Location } from '@angular/common';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {
  form: FormGroup;
  registered = false;
  edited = false;
  editMode = false;  
  user: User;
  ifError = false;
  errorData: String = '';
  noLimit: string; 
   
  constructor(private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private renderer: Renderer2,
              private location: Location) { }

  ngOnInit() {
    this.getParams(); 
    this.initForm();
    this.editMode && this.authService.getUser()
                         .subscribe(data => {
                            this.user = data.data.user;
                            this.initForm();
                         })
  }

  getParams() {
    this.route.paramMap
        .subscribe((params: Params) => {
          this.editMode = params.params.id ? true : false;
        })

    this.route.queryParams
      .subscribe(params => {
         this.noLimit = params.noLimit;
      });
  }

  resetEdited() {
    location.reload();
  }

  initForm() {
    let firstname = this.editMode && this.user ? this.user.firstname : '',
        lastname = this.editMode && this.user ? this.user.lastname : '',
        email = this.editMode && this.user ? this.user.email : '',
        password = '',
        deposit_limit = this.editMode && this.user ? this.user.deposit_limit : 5,
        frequency_limit = this.editMode && this.user ? this.user.frequency_limit : '';
    this.form = new FormGroup({
      'firstname': new FormControl(firstname, {validators: [Validators.required]}),
      'lastname': new FormControl(lastname, {validators: [Validators.required]}),
      'email': new FormControl(email, {validators: [Validators.required]}),
      'password': new FormControl(password, {validators: [Validators.required]}),
      'deposit_limit': new FormControl(deposit_limit, {validators: [Validators.required]}),
      'frequency_limit': new FormControl(frequency_limit, {validators: [Validators.required]})
    });
  }

  handleSelectColor(event: Event) {
      this.renderer.setStyle(event.target, 'color', '#272727');
  }

  onHandleWrongNubers(e: KeyboardEvent) {
    if(e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode < 48 || e.keyCode > 57 && e.keyCode < 96 || e.keyCode > 105) { 
        return false;
    }
  }
  
  onSubmitUser() {
    const _id = localStorage.getItem('id');
    const firstname = this.form.value.firstname,
          lastname = this.form.value.lastname,
          email = this.form.value.email,
          password = this.form.value.password,
          deposit_limit = +this.form.value.deposit_limit,
          frequency_limit = this.form.value.frequency_limit;
    const deposit_date = "" + new Date().getTime();
    if(!firstname || !lastname || !email || !password || !frequency_limit || !deposit_limit || !deposit_date) {
       this.ifError = true;
       this.registered = false; 
       this.errorData = "Fields can't be empty!"                     
    }
    else {
      if(this.editMode) {
         const user = {_id, firstname, lastname, email, password, frequency_limit, deposit_limit, deposit_date};
         this.authService.updateUser(user)
                         .subscribe(({ data, errors }) => {
                          if(errors) {
                            this.errorData = errors.reduce((tot, err) => {
                                return tot = tot + ' ' + err.message;
                            }, '');
                          }
                          if(this.errorData.length > 0) {
                             this.ifError = true;
                             this.registered = false;
                          }
                          this.registered = true;
                          this.edited = true; 
                          return data;   
                         },(error) => {
                            this.ifError = true;
                            this.registered = false;  
                            this.errorData = "Something went wrong. Try again!";
                        }) 
      }
      else {
          const user = {firstname, lastname, email, password, frequency_limit, deposit_limit, deposit_date};
          this.authService.signupUser(user)
                          .subscribe(({ data, errors }) => {
                            if(errors) {
                              this.errorData = errors.reduce((tot, err) => {
                                  return tot = tot + ' ' + err.message;
                              }, '');
                            }
                            if(this.errorData.length > 0) {
                               this.ifError = true;
                               this.registered = false;
                            }
                            this.registered = true;                            
                            return data;                
                          },(error) => {
                             this.ifError = true;
                             this.registered = false;  
                             this.errorData = "Something went wrong. Try again!";
                          });
      }                        
    }
  }

  handleCancelEdit() {
    this.router.navigate(['my-account']);
  }

  handleCloseModal(event: boolean) {
    this.ifError = event;
    !this.ifError && (this.errorData = '');
  }

  ngOnDestroy() {
    this.ifError = false;
    this.errorData = '';
 } 
}
