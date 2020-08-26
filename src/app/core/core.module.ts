import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from '../app-routing.module';
import { FooterComponent } from './footer/footer.component';
import { BettingService } from '../betting/betting.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { BetsService } from '../betting/bets.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [
        HeaderComponent,
        FooterComponent
    ],
    imports: [
        AppRoutingModule,
        CommonModule,
        FontAwesomeModule
    ],
    exports: [
        AppRoutingModule,
        HeaderComponent,
        FooterComponent
    ],
    providers: [
        BettingService, 
        BetsService,
        AuthService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ]
})

export class CoreModule {};
