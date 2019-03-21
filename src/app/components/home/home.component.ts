import {Component, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect} from '@angular/material';
import {latLng, Map as LeafletMap, MapOptions, Marker, tileLayer} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {FeatureCollection} from 'geojson';
import {getMarkerDictKey, getLeafletMarkerDict} from './home.component.functions';
import {AREAS, DEFAULT_COORDS, DENSITIES, VEHICLES, YEARS} from './home.component.constants';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('areaSelector') private areaSelector: MatSelect;
  @ViewChild('yearSelector') private yearSelector: MatSelect;
  @ViewChild('vehicleSelector') private vehicleSelector: MatSelect;
  @ViewChild('densitySelector') private densitySelector: MatSelect;

  private DEFAULT_ZOOM = 11;

  private leafletMarkerDict: {[markerKey: string]: Marker[]} = {};
  private currentLeafletMarkers: Marker[] = [];

  private map: LeafletMap;

  // Fields accessed by the HTML (template).
  public objectKeys = Object.keys;
  public densities = DENSITIES;
  public years = YEARS;
  public vehicleTypes = VEHICLES;
  public areas = AREAS;

  // Used by the HTML/template to set Leaflet's options.
  public leafletOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: this.DEFAULT_ZOOM,
    center: latLng(DEFAULT_COORDS)
  };

  public constructor(private titleService: Title, private http: HttpClient) {
    titleService.setTitle('Portland Traffic Reform');
  }

  private updateLeafletMapLocation(): void {
    const coordinates = this.areas[this.areaSelector.value];
    const zoom = this.areaSelector.value === Object.keys(this.areas)[0] ? this.DEFAULT_ZOOM : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  private updateDisplayedLeafletMarkers(): void {
    this.currentLeafletMarkers.forEach(leafletMarker => this.map.removeLayer(leafletMarker));

    const selectedArea: string = this.areaSelector.value;
    const selectedVehicle: string = this.vehicleSelector.value;
    const selectedYear: string = this.yearSelector.value;
    const selectedDensity: string = this.densitySelector.value;

    const markerDictKey = getMarkerDictKey(selectedArea, selectedVehicle, selectedYear, selectedDensity);
    const relevantTrafficMarkers = this.leafletMarkerDict[markerDictKey];

    this.currentLeafletMarkers = relevantTrafficMarkers.map(leafletMarker => {
        this.map.addLayer(leafletMarker);
        return leafletMarker;
      }
    );
  }

  public updateMap(): void {
    this.updateDisplayedLeafletMarkers();
    this.updateLeafletMapLocation();
  }

  public setFilterDefaultsAndUpdateMap(): void {
    this.areaSelector.value = Object.keys(this.areas)[0];
    this.yearSelector.value = this.years[0];
    this.vehicleSelector.value = this.vehicleTypes[0];
    this.densitySelector.value = Object.keys(this.densities)[0];

    this.updateMap();
  }

  /**
   * Initialize Leaflet map.
   * @param map The Leaflet map to initialize.
   */
  public onMapReady(map: LeafletMap): void {
    this.map = map;

    const TRAFFIC_URL = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    this.http.get(TRAFFIC_URL).subscribe((trafficJson: FeatureCollection) => {
      this.leafletMarkerDict = getLeafletMarkerDict(trafficJson.features);
      this.setFilterDefaultsAndUpdateMap();
    });
  }
}
