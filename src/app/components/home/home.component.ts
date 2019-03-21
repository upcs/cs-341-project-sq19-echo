import {Component, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect} from '@angular/material';
import {latLng, LatLngExpression, Map as LeafletMap, MapOptions, Marker, tileLayer} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {Feature, FeatureCollection} from 'geojson';
import {TrafficMarker} from './home.component.interfaces';
import {
  getLeafletMarkerFromTrafficMarker,
  getTrafficMarkersFromFeatures,
  inDensityRange,
  markerValidForVehicleFilter
} from './home.component.functions';
import {DENSITIES} from './home.component.constants';

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

  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];
  private trafficMarkers: {[markerType: string]: TrafficMarker[]} = {};

  private leafletMarkers: Marker[] = [];
  private map: LeafletMap;

  // Fields accessed by the HTML (template).
  public objectKeys = Object.keys;
  public densities = DENSITIES;
  public years = ['All', '2019', '2018', '2017', '2016', '2015', '2014'];
  public vehicleTypes = ['Both', 'Bike', 'Car'];
  public areas: {[location: string]: LatLngExpression} = {
    'All': this.DEFAULT_COORDS,
    'North': [45.6075, -122.7236],
    'South': [45.4886, -122.6755],
    'Northwest': [45.5586, -122.7609],
    'Northeast': [45.5676, -122.6179],
    'Southwest': [45.4849, -122.7116],
    'Southeast': [45.4914, -122.5930]
  };

  // Used by the HTML/template to set Leaflet's options.
  public leafletOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 11,
    center: latLng(this.DEFAULT_COORDS)
  };

  public constructor(private titleService: Title, private http: HttpClient) {
    titleService.setTitle('Portland Traffic Reform');
  }

  private getMarkerDictKey(area: string, vehicle: string, year: string, density: string): string {
    return `${area}:${vehicle}:${year}:${density}`;
  }

  private initializeTrafficMarkerDict(features: Feature[]) {
    const allTrafficMarkers = getTrafficMarkersFromFeatures(features);

    Object.keys(this.densities).forEach(density =>
      Object.keys(this.areas).forEach(area =>
        this.years.forEach(year =>
          this.vehicleTypes.forEach(vehicle => {
              const markerDictKey = this.getMarkerDictKey(area, vehicle, year, density);
              this.trafficMarkers[markerDictKey] = allTrafficMarkers.filter(marker =>
                inDensityRange(marker.trafficDensity, this.densities[density]) &&
                (marker.startDate.includes(year) || year === this.years[0]) &&
                markerValidForVehicleFilter(marker, vehicle)
              );
            }
          )
        )
      )
    );
  }

  private updateLeafletMapLocation(): void {
    const coordinates = this.areas[this.areaSelector.value];
    const zoom = this.areaSelector.value === Object.keys(this.areas)[0] ? 11 : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  private updateDisplayedLeafletMarkers(): void {
    this.leafletMarkers.forEach(marker => this.map.removeLayer(marker));

    const selectedArea: string = this.areaSelector.value;
    const selectedVehicle: string = this.vehicleSelector.value;
    const selectedYear: string = this.yearSelector.value;
    const selectedDensity: string = this.densitySelector.value;

    const markerDictKey = this.getMarkerDictKey(selectedArea, selectedVehicle, selectedYear, selectedDensity);
    const relevantTrafficMarkers = this.trafficMarkers[markerDictKey];

    this.leafletMarkers = relevantTrafficMarkers.map(trafficMarker => {
        const leafletMarker = getLeafletMarkerFromTrafficMarker(trafficMarker);
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
      this.initializeTrafficMarkerDict(trafficJson.features);
      this.setFilterDefaultsAndUpdateMap();
    });
  }
}
