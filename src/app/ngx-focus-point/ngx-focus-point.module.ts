import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFocusPointComponent } from './components/ngx-focus-point/ngx-focus-point.component';
import { NgxFocusPointSelectComponent } from './components/ngx-focus-point-select/ngx-focus-point-select.component';

@NgModule({
  declarations: [NgxFocusPointComponent, NgxFocusPointSelectComponent],
  imports: [
    CommonModule
  ], exports: [NgxFocusPointComponent, NgxFocusPointSelectComponent]
})
export class NgxFocusPointModule { }
