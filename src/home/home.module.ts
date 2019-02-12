import {BrowserModule, Title} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {HomeComponent} from './home.component';
import {MaterialModule} from "../helpers/material.module";

@NgModule({
  declarations: [HomeComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MaterialModule, LeafletModule],
  exports: [HomeModule],
  providers: [Title]
})
export class HomeModule {
}
