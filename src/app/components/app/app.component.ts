import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public navLabels: {label: string, route: string}[] = [{label: 'home', route: 'home'}, {label: 'about', route: 'about'}];

  public constructor(private titleService: Title, private cookie: CookieService) {
    titleService.setTitle('Echo App');

    const loggedInUser = `${cookie.get('authenticated')}`;
    const label = loggedInUser ? loggedInUser : 'login';
    this.navLabels.push({label, route: 'user'});
  }
}
