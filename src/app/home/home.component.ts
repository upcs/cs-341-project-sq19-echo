import {Component, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {MatSelect} from "@angular/material";
import {latLng, tileLayer, Map as LeafletMap, LatLngExpression, marker, layerGroup, LayerGroup} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {Feature, FeatureCollection} from "geojson";

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
  @ViewChild('areaSelector')
  private areaSelector: MatSelect;

  @ViewChild('yearSelector')
  private yearSelector: MatSelect;

  @ViewChild('vehicleSelector')
  private vehicleSelector: MatSelect;

  @ViewChild('densitySelector')
  private densitySelector: MatSelect;


  years: String[] = ["2018", "2017", "2016", "2015", "2014"];
  areas: Location[] = [
    {name: "North", coordinate: [45.6075, -122.7236]},
    {name: "South", coordinate: [45.4886, -122.6755]},
    {name: "Northwest", coordinate: [45.5586, -122.7609]},
    {name: "Northeast", coordinate: [45.5676, -122.6179]},
    {name: "Southwest", coordinate: [45.4849, -122.7116]},
    {name: "Southeast", coordinate: [45.4914, -122.5930]}
  ];
  vehicles: String[] = ["Car", "Bike"];
  densities: String[] = ["High", "Medium", "Low"];

  private trafficFeatures: Array<Feature>;
  private bikeTraffic: LayerGroup = layerGroup();
  private carTraffic: LayerGroup = layerGroup();
  private map: LeafletMap;

  leafletOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 11,
    center: latLng([45.5122, -122.6587])
  };

  public constructor(private titleService: Title, private http: HttpClient) {
    titleService.setTitle("Portland Traffic Reform");
  }

  filterData(): void {
    let selectedLocation: Location = this.areaSelector.value;
    let selectedYear: number = this.yearSelector.value;
    let selectedVehicle: String = this.vehicleSelector.value;
    let selectedDensity: String = this.densitySelector.value;
    
    let maxFlow: number;
    let minFlow: number;
    let vehicle: String;

    let zoom: number = 12.5;
    // change map region of map to be displayed based on selection
    if(selectedLocation.name === "All Locations") zoom = 11;
    this.map.flyTo(selectedLocation.coordinate as LatLngExpression, zoom);
  }

  // initialize Leaflet map.
  onMapReady(map: LeafletMap): void {
    this.map = map;

    const trafficUrl = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    this.http.get(trafficUrl).subscribe((trafficJson: FeatureCollection) => {
      this.trafficFeatures = trafficJson.features;

      // Example of filtering data. For now just filter data to be bike data. This will change later.
      for (let point of this.trafficFeatures) {
        if (point.properties.ExceptType === "Bike Count") {
          // The coordinates are reversed in the JSON.
          let coordinates: number[] = (point.geometry as any).coordinates;
          this.bikeTraffic.addLayer(marker(coordinates.reverse() as LatLngExpression));
        }
      }
      this.bikeTraffic.addTo(this.map);
    });
  }
}
