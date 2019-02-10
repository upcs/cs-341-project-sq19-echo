import { Component } from '@angular/core';
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public constructor(private titleService: Title) {
    titleService.setTitle("Portland Traffic Reform")
  }
}
