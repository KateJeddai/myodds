import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../user';
import { Subscription } from 'apollo-client/util/Observable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss']
})
export class MyaccountComponent implements OnInit, OnDestroy {
  private isAuthenticated = false;
  private authListenerSub: Subscription;
  private userSubscription: Subscription;
  private userData: User;
  private ifError = false;
  private errorData: String = '';
  timeLeftToDepositReset = {
    days: null,
    hours: null,
    mins: null,
    secs: null
  };
  noLimit: boolean = false;
  resetDeposit = false;
  formReset: FormGroup;

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.isAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService.getAuthStateListener()    
                    .subscribe(isAuthenticated => {
                        this.isAuthenticated = isAuthenticated;
                        if(!this.isAuthenticated) {
                            this.router.navigate(['/']);
                        }
                    }, (err) => {
                      this.ifError = true;
                      this.errorData = err;
                    });
    this.userSubscription = this.authService.getUser()
                    .subscribe(({data}) => {
                       this.userData = data.user;
                       this.userData && this.countTimeToDepositUpdate(this.userData.frequency_limit);
                    }, (err) => {
                        this.ifError = err;
                        this.errorData = err;
                    })        
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.ifError = false;
    this.errorData = '';
  }
  
  onHandleWrongKeys(e: KeyboardEvent) {
    if (e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode < 48 || 
        e.keyCode > 57 && e.keyCode < 96 || e.keyCode > 105) { 
            return false;
    }
  }

  handleResetDepositForm() {
    this.resetDeposit = !this.resetDeposit;    
    this.formReset = new FormGroup({
      'deposit_limit': new FormControl(null, {validators: [Validators.required]}),
      'frequency_limit': new FormControl(null, {validators: [Validators.required]})
    })
  }

  handleResetDeposit() {
    const newDeposit = this.formReset.value.deposit_limit,
          depositFrequency = this.formReset.value.frequency_limit,
          userId = localStorage.getItem('id');
    this.authService.updateUserDeposit(userId, newDeposit, depositFrequency)
        .subscribe(data => {
          if(data) {
            this.resetDeposit = false;
          }
        }, (err) => {
            this.ifError = true;
            this.errorData = err;
        })
  }

  countMsToAdd(numOfDays) {    
      const ms = numOfDays * 24 * 60 * 60 * 1000;
      return ms;
  }

  depositTimer(ms) {    
    const now = new Date().getTime();
    const diff = ms - now;
    this.timeLeftToDepositReset.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.timeLeftToDepositReset.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) < 10 ? 
                                            "0" + Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) :
                                             Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));                                                                                                     
    this.timeLeftToDepositReset.mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) < 10 ?
                                            "0" + Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) :
                                             Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.timeLeftToDepositReset.secs = Math.floor((diff % (1000 * 60)) / 1000) < 10 ?
                                            "0" + Math.floor((diff % (1000 * 60)) / 1000) : 
                                             Math.floor((diff % (1000 * 60)) / 1000); 
    let setTime = setTimeout(() => {
      this.depositTimer(ms); 
    }, 1000); 

    if(diff <= 0) {
      this.noLimit = true;
      clearTimeout(setTime);
    }    
  }  
  
  countTimeToDepositUpdate(period) {
    const depositSettingTime = +this.userData.deposit_date;
    switch(period) {
      case "No limit": 
        this.noLimit = true;
        break;
      case "Daily": 
        {const msToAdd = this.countMsToAdd(1);
        const timeLeftToReset = depositSettingTime + msToAdd;
        this.depositTimer(timeLeftToReset);
        break;}
      case "Weekly": 
        {const msToAdd = this.countMsToAdd(7);
        const timeLeftToReset = depositSettingTime + msToAdd;
        this.depositTimer(timeLeftToReset);
        break;}
      case "Monthly": 
        {
         const dateMs = new Date(depositSettingTime),
                year = dateMs.getFullYear(),
                month = dateMs.getMonth(),
                date = dateMs.getDate(),
                hours = dateMs.getHours(),
                mins = dateMs.getMinutes();
          const newDate = new Date(year, month + 1, date, hours, mins, 0) 
          const msToAdd = newDate.getTime() - depositSettingTime;
          const timeLeftToReset = depositSettingTime + msToAdd;
          this.depositTimer(timeLeftToReset);
          break;
        }
      default: 
        return;   
    }
  }

  handleCloseModal(event: boolean) {
    this.ifError = event;
    !this.ifError && (this.errorData = '');
  }  
}
