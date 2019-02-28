import {Component, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatCard, MatCardHeader, MatCardModule} from '@angular/material';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-root',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})

@NgModule({
  declarations: [AppComponent],
  imports: [MatCardModule, MatCardHeader, MatCard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class AboutComponent {
  public constructor(private titleService: Title) {
    titleService.setTitle('About Page');
  }
}
