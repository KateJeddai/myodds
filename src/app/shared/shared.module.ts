import { NgModule } from '@angular/core';
import { ShowbetsButtonsComponent } from './showbets-buttons/showbets-buttons.component';
import { CommonModule } from '@angular/common';
import { ErrorModalComponent } from './error-modal/error-modal.component';

@NgModule({
    declarations: [
        ShowbetsButtonsComponent,
        ErrorModalComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        CommonModule,
        ShowbetsButtonsComponent,
        ErrorModalComponent
    ]
})

export class SharedModule {}
