import {Component, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect} from '@angular/material';
import {
  latLng,
  LatLngExpression,
  Map as LeafletMap,
  MapOptions, Marker,
  tileLayer
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {FeatureCollection} from 'geojson';
import {DensityInfo, TrafficMarker} from './home.component.interfaces';
import {
  getLeafletMarkerFromTrafficMarker,
  getTrafficMarkersFromFeatures,
  getVehicleFilterFromVehicleSelectorValue,
  inDensityRange,
  markerValidForVehicleFilter
} from './home.component.functions';
import {TrafficLocation, VehicleType} from './home.component.enums';
import {DENSITIES} from './home.component.constants';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // For template to function properly.
  objectKeys = Object.keys;
  densities = DENSITIES;

  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];
  private DEFAULT_INTENSITY_RANGE: DensityInfo = {min: 0, max: 100000};

  private allTrafficMarkers: TrafficMarker[];
  private leafletMarkers: Marker[] = [];
  private map: LeafletMap;

  years: string[] = ['2019', '2018', '2017', '2016', '2015', '2014'];
  vehicles: string[] = Object.keys(VehicleType);

  areas: {[location: string]: LatLngExpression} = {
    [TrafficLocation.North]: [45.6075, -122.7236],
    [TrafficLocation.South]: [45.4886, -122.6755],
    [TrafficLocation.Northwest]: [45.5586, -122.7609],
    [TrafficLocation.Northeast]: [45.5676, -122.6179],
    [TrafficLocation.Southwest]: [45.4849, -122.7116],
    [TrafficLocation.Southeast]: [45.4914, -122.5930]
  };

  leafletOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 11,
    center: latLng(this.DEFAULT_COORDS)
  };

  public constructor(
    private titleService: Title,
    private http: HttpClient,
    @ViewChild('areaSelector') private areaSelector: MatSelect,
    @ViewChild('yearSelector') private yearSelector: MatSelect,
    @ViewChild('vehicleSelector') private vehicleSelector: MatSelect,
    @ViewChild('densitySelector') private densitySelector: MatSelect
  ) {
    titleService.setTitle('Portland Traffic Reform');
  }

  isRelevantMarker(trafficMarker: TrafficMarker): boolean {
    const selectedYear = this.yearSelector.empty ? '-' : this.yearSelector.value;
    const selectedDensity = this.densitySelector.empty ? this.DEFAULT_INTENSITY_RANGE : this.densitySelector.value;
    const selectedVehicleFilter = getVehicleFilterFromVehicleSelectorValue(this.vehicleSelector.value);

    return inDensityRange(trafficMarker.trafficDensity, selectedDensity)
        && trafficMarker.startDate.includes(selectedYear)
        && markerValidForVehicleFilter(trafficMarker, selectedVehicleFilter);
  }

  updateDisplayedTrafficMarkers(): void {
    this.leafletMarkers.forEach(marker => this.map.removeLayer(marker));

    const relevantTrafficMarkers: TrafficMarker[] = this.allTrafficMarkers.filter(
      trafficMarker => this.isRelevantMarker(trafficMarker)
    );

    this.leafletMarkers = relevantTrafficMarkers.map(trafficMarker => {
        const leafletMarker = getLeafletMarkerFromTrafficMarker(trafficMarker);
        this.map.addLayer(leafletMarker);
        return leafletMarker;
      }
    );

    const coordinates = this.areaSelector.empty ? this.DEFAULT_COORDS : this.areaSelector.value.coordinates;
    const zoom = this.areaSelector.empty ? 11 : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  clearFilters(): void {
    this.areaSelector.value = '';
    this.yearSelector.value = '';
    this.vehicleSelector.value = '';
    this.densitySelector.value = '';

    this.updateDisplayedTrafficMarkers();
  }

  /**
   * Initialize Leaflet map.
   * @param map The Leaflet map to initialize.
   */
  onMapReady(map: LeafletMap): void {
    this.map = map;

    const TRAFFIC_URL = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    this.http.get(TRAFFIC_URL).subscribe((trafficJson: FeatureCollection) => {
      this.allTrafficMarkers = getTrafficMarkersFromFeatures(trafficJson.features);
      this.updateDisplayedTrafficMarkers();
    });
  }
}
