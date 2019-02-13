import {Component, ElementRef, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  navLabels: string[] = ['home', 'about', 'login'];

  @ViewChild('navItemList') navItemList: ElementRef;

  public constructor(private titleService: Title) {
    titleService.setTitle("Echo App");
  }
}
