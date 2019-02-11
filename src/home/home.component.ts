import {Component, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {MatSelect} from "@angular/material";
declare let L;

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  @ViewChild('areaSelector') areaSelector: MatSelect;
  @ViewChild('yearSelector') yearSelector: MatSelect;
  @ViewChild('selectedMessage') selectedMessage: string;

  years: number[] = [1960, 1970, 1980, 1990, 2000, 2010, 2018];
  areas: string[] = ["North", "South", "Northwest", "Northeast", "Southwest", "Southeast"];

  public constructor(private titleService: Title) {
    titleService.setTitle("Portland Traffic Reform");
  }

  loadData() {
    if (this.areaSelector.empty || this.yearSelector.empty) {
      return;
    }

    this.selectedMessage = `Area ${this.areaSelector.value} and year ${this.yearSelector.value} selected.`;
  }

  ngOnInit() {
    const map = L.map('map').setView([45.5122, -122.6587], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }
}
