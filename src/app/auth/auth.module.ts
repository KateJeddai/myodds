import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { SigninComponent } from './signin/signin.component';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { SharedModule } from '../shared/shared.module';
import { RestorePassComponent } from './restore-pass/restore-pass.component';
import { NewPasswordComponent } from './new-password/new-password.component';

@NgModule({
    declarations: [
        SigninComponent,
        LoginComponent,
        MyaccountComponent,
        RestorePassComponent,
        NewPasswordComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AuthRoutingModule,
        SharedModule,
        FormsModule
    ]
})

export class AuthModule {};
