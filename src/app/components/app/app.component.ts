import {Component, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {mainRoutes} from '../../app-routing.module';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  navLabels: string[] = mainRoutes.map(x => x.path);

  public constructor(
    private titleService: Title,
    private cookie: CookieService,
    @ViewChild('navItemList') private navItemList: ElementRef
  ) {
    titleService.setTitle('Echo App');

    let loggedInUser = cookie.get('authenticated');
    if (!loggedInUser) {
      loggedInUser = 'GUEST';
    }

    this.navLabels.push(`WELCOME, ${loggedInUser}`);
  }
}
