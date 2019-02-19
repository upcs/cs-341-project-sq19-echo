import {Component, ElementRef, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {mainRoutes} from "./app-routing.module";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  navLabels: string[] = mainRoutes.map(x => x.path);

  @ViewChild('navItemList') navItemList: ElementRef;

  public constructor(private titleService: Title) {
    titleService.setTitle("Echo App");
  }
}
