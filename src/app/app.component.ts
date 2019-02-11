import {Component, ElementRef, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";
import * as $ from 'jquery';

interface NavbarLabel {
  readonly path: string;
  readonly title: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  navLabels: NavbarLabel[] = [
    {path: 'home', title: 'Home'},
    {path: 'about', title: 'About'},
    {path: 'login', title: 'Login'}
  ];

  @ViewChild('navItemList') navItemList: ElementRef;
  @ViewChild('test') test: ElementRef;

  public constructor(private titleService: Title) {
    titleService.setTitle("Echo App");
  }
}
