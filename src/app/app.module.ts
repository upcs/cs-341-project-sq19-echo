import {BrowserModule, Title} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {AppComponent} from './components/app/app.component';
import {AppRoutingModule} from './app-routing.module';
import {MaterialModule} from '../helpers/material.module';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {AboutComponent} from './components/about/about.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {GameComponent} from './components/game/game.component';

@NgModule({
  declarations: [
    AppComponent, AboutComponent, HomeComponent, LoginComponent, GameComponent
  ],
  imports: [
    MDBBootstrapModule.forRoot(),
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    LeafletModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [Title, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {}
