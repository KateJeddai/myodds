import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private authService: AuthService,
                private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, 
                state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        const isAdmin = this.authService.getIfAdmin();
        if(!isAdmin) {
            this.router.navigate(['/login'], {queryParams: {'redirectURL': state.url}});
        }
        return isAdmin;
    }
}
 
