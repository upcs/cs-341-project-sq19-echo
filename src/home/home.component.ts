import {Component, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {MatSelect} from "@angular/material";
import {latLng, tileLayer, Map as LeafletMap, LatLngExpression} from 'leaflet';

interface Location {
  readonly name: string;
  readonly coordinate: number[];
}

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('areaSelector') areaSelector: MatSelect;
  @ViewChild('yearSelector') yearSelector: MatSelect;
  @ViewChild('selectedMessage') selectedMessage: string;
  
  map: LeafletMap;
  years: number[] = [1960, 1970, 1980, 1990, 2000, 2010, 2018];
  areas: Location[] = [
    {name: "North",     coordinate: [45.6075, -122.7236]},
    {name: "South",     coordinate: [45.4886, -122.6755]},
    {name: "Northwest", coordinate: [45.5586, -122.7609]},
    {name: "Northeast", coordinate: [45.5676, -122.6179]},
    {name: "Southwest", coordinate: [45.4849, -122.7116]},
    {name: "Southeast", coordinate: [45.4914, -122.5930]}
  ];

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

    let selectedLocation: Location = this.areaSelector.value;
    let selectedYear: number = this.yearSelector.value;
    this.selectedMessage = `Area ${selectedLocation.name} and year ${selectedYear} selected.`;

    // change map region of map to be displayed based on selection
    this.map.flyTo(selectedLocation.coordinate as LatLngExpression, 12.5);
  }

  // initialize Leaflet map.
  onMapReady(map: LeafletMap) {
    this.map = map;
  }
}
