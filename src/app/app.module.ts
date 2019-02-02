import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {NgxFocusPointModule} from './ngx-focus-point/ngx-focus-point.module';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxFocusPointModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
