import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BettingChartComponent } from '../betting/betting-chart.component';
import { BettingFormComponent } from './betting-form/betting-form.component';
import { AddGameComponent } from './add-game/add-game.component';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { BetsListComponent } from './bets-list/bets-list.component';

const bettingRoutes: Routes = [
    { path: '', component: BettingChartComponent, pathMatch: 'full' },
    { path: 'place-bet/:id', component: BettingFormComponent, canActivate: [AuthGuard] },
    { path: 'bets-list/:id', component: BetsListComponent, canActivate: [AuthGuard] },
    { path: 'add-game', component: AddGameComponent, canActivate: [AdminGuard] },
    { path: 'edit/:id', component: AddGameComponent, canActivate: [AdminGuard] }
];

@NgModule({
    imports: [
        RouterModule.forChild(bettingRoutes)
    ],
    exports: [RouterModule],
    providers: [AuthGuard, AdminGuard]
})

export class BettingRoutingModule {};
