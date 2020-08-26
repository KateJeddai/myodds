import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
   { path: '', redirectTo: '/betting', pathMatch: 'full' },
  // { path: 'betting', loadChildren: () => import('./betting/betting.module').then(mod => mod.BettingModule)}
   { path: 'betting', loadChildren: './betting/betting.module#BettingModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
