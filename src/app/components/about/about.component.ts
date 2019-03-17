import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {PersonInfo} from './about.component.interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  public people: PersonInfo[] = [
    {
      name: 'Alex Hadi',
      classStanding: 'Junior',
      imageUrl: 'https://tinyurl.com/y25pe2wy',
      mainContent: `Alex Hadi wants to teach you about angular.
                    He really enjoys doing all of the sprints, and wants to become a usain bolt type sprinter.`,
      emailAddress: 'hadi20@up.edu'
    },
    {
      name: 'Adam Mercer',
      classStanding: 'Junior',
      imageUrl: 'https://tinyurl.com/y4tlsscn',
      mainContent: 'Is really good at finding problems... not solving them.',
      emailAddress: 'mercer20@up.edu'
    },
    {
      name: 'Pele Kamala',
      classStanding: 'Sophomore',
      imageUrl: 'https://tinyurl.com/y2xure62',
      mainContent: 'Is very eager to work on SQL with Alex.',
      emailAddress: 'kamala21@up.edu'
    },
    {
      name: 'Callum Morham',
      classStanding: 'Junior',
      imageUrl: 'https://tinyurl.com/y2k4q5uq',
      mainContent: 'Is the embodiment of larry the lobster.',
      emailAddress: 'morham20@up.edu'
    },
    {
      name: 'Chris Sebrechts',
      classStanding: 'Junior',
      imageUrl: 'https://tinyurl.com/y4zuw9pr',
      mainContent: 'Does not like algorithms.',
      emailAddress: 'sebrecht20@up.edu'
    }
  ];

  public constructor(private titleService: Title) {
    titleService.setTitle('About Page');
  }

  public openEmail(email: string): void {
    window.open(`mailto:${email}`, '_parent');
  }
}
