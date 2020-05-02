import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxFocusPointComponent} from "./ngx-focus-point.component";
import {NgxFocusPointSelectComponent} from "./ngx-focus-point-select.component";


@NgModule({
  declarations: [NgxFocusPointComponent, NgxFocusPointSelectComponent],
  imports: [
    CommonModule
  ], exports: [NgxFocusPointComponent, NgxFocusPointSelectComponent]
})
export class NgxFocusPointModule { }
