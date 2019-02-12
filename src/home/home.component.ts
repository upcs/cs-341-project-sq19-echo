import {Component, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {MatSelect} from "@angular/material";
import { latLng, tileLayer } from 'leaflet';
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
  
  map: L.Map;
  years: number[] = [1960, 1970, 1980, 1990, 2000, 2010, 2018];
  areas: string[] = ["North", "South", "Northwest", "Northeast", "Southwest", "Southeast"];

  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 10,
    center: latLng([45.5122, -122.6587])
  };

  public constructor(private titleService: Title) {
    titleService.setTitle("Portland Traffic Reform");
  }

  loadData() {
    if (this.areaSelector.empty || this.yearSelector.empty) {
      return;
    }
    this.selectedMessage = `Area ${this.areaSelector.value} and year ${this.yearSelector.value} selected.`;
    // change map region of map to be displayed based on selection
    if (this.areaSelector.value == 'Northwest') {
      this.map.flyTo([45.5586, -122.7609], 12.5);
    }
    else if (this.areaSelector.value == 'Northeast') {
      this.map.flyTo([45.5676, -122.6179], 12.5);
    }
    else if (this.areaSelector.value == 'North') {
      this.map.flyTo([45.6075, -122.7236], 12.5);
    }
    else if (this.areaSelector.value == 'Southwest') {
      this.map.flyTo([45.4849, -122.7116], 12.5);
    }
    else if (this.areaSelector.value == 'Southeast') {
      this.map.flyTo([45.4914, -122.5930], 12.5);
    }
    else if (this.areaSelector.value == 'South') {
      this.map.flyTo([45.4886, -122.6755], 12.5);
    }
  }

  // initialize map
  onMapReady(map: L.Map) {
    this.map = map;
  }
}
