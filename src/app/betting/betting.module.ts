import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { BettingRoutingModule } from './betting-routing.module';
import { BettingChartComponent } from './betting-chart.component';
import { BettingFormComponent } from './betting-form/betting-form.component';
import { AddGameComponent } from './add-game/add-game.component';
import { AddResultComponent } from './add-result/add-result.component';
import { BetsListComponent } from './bets-list/bets-list.component';
import { BetComponent } from './bet/bet.component';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddTeamLogoComponent } from './add-team-logo/add-team-logo.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BetPaginatorComponent } from './bet-paginator/bet-paginator.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
        BettingChartComponent,
        BettingFormComponent,
        AddGameComponent,
        AddResultComponent,
        BetsListComponent,
        BetComponent,
        AddTeamLogoComponent,
        BetPaginatorComponent        
    ],
    imports: [
        CommonModule,        
        ReactiveFormsModule,
        FormsModule,
        BettingRoutingModule,
        SharedModule,
        FontAwesomeModule,
        MatPaginatorModule,
        DragDropModule
    ]
})

export class BettingModule {};
