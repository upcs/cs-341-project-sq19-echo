import {BrowserModule, Title} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {AboutComponent} from './about.component';
import {MaterialModule} from "../helpers/material.module";

@NgModule({
  declarations: [AboutComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MaterialModule],
  exports: [AboutModule],
  providers: [Title]
})
export class AboutModule {}
