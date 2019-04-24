import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {CookieService} from 'ngx-cookie-service';
import {INavigationLabel} from './app.component.interfaces';
import {mainRoutes} from '../../app-routing.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public navLabels: INavigationLabel[] = mainRoutes.map(x => ({label: x.path, route: x.path}));

  public constructor(public titleService: Title, public cookie: CookieService) {
    titleService.setTitle('Echo App');

    const loggedInUser = `${cookie.get('authenticated')}`;
    const label = loggedInUser ? loggedInUser : 'login';
    this.navLabels.push({label, route: 'user'});
  }
}
