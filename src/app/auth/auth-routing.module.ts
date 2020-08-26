import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { LoginComponent } from './login/login.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { RestorePassComponent } from './restore-pass/restore-pass.component';
import { NewPasswordComponent } from './new-password/new-password.component';

const authRoutes: Routes = [
    { path: 'register', component: SigninComponent, pathMatch: 'full' },
    { path: 'register/:id', component: SigninComponent },
    { path: 'login', component: LoginComponent },
    { path: 'restore-password', component: RestorePassComponent },
    { path: 'new-password', component: NewPasswordComponent},
    { path: 'my-account', component: MyaccountComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(authRoutes)
    ],
    exports: [RouterModule]
})

export class AuthRoutingModule {};
