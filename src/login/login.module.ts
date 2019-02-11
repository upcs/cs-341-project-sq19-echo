import {BrowserModule, Title} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {LoginComponent} from './login.component';
import {MaterialModule} from "../helpers/material.module";

@NgModule({
  declarations: [LoginComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MaterialModule],
  exports: [LoginModule],
  providers: [Title]
})
export class LoginModule {}
