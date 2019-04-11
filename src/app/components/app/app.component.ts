import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {mainRoutes} from '../../app-routing.module';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  //public navLabels: string[] = mainRoutes.map(x => x.path);
  public navLabels: {label: string, route: string}[] = [{label: 'home', route: 'home'}, {label: 'about', route: 'about'}]

  public constructor(private titleService: Title, private cookie: CookieService) {
    titleService.setTitle('Echo App');

    const loggedInUser = '' + cookie.get('authenticated');
    if (!loggedInUser) {
      this.navLabels.push({label: 'login', route: 'user'});
    }
    else {
      this.navLabels.push({label: loggedInUser, route: 'user'})
    }
  }
}
