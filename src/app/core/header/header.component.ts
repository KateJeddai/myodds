import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { faFutbol } from '@fortawesome/free-regular-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  private authListenerSub: Subscription;
  faFutbol = faFutbol;

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.isAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService.getAuthStateListener()    
                                           .subscribe(isAuthenticated => {
                                              this.isAuthenticated = isAuthenticated;
                                           });
  }
  
  onLogout() {
    this.authService.logout();
  }

}
