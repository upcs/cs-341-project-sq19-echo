import {Component, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect} from '@angular/material';
import {latLng, tileLayer, Map as LeafletMap, LatLngExpression, layerGroup, LayerGroup, MapOptions, marker} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {FeatureCollection} from 'geojson';
import {DensityInfo, TrafficMarker} from './home.interfaces';
import {inDensityRange, getMarkersFromFeatures, getDensityIconFromMarker} from './home.functions';
import {TrafficLocation} from './home.enums';
import {DENSITIES} from './home.constants';

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

  @ViewChild('areaSelector') private areaSelector: MatSelect;
  @ViewChild('yearSelector') private yearSelector: MatSelect;
  @ViewChild('vehicleSelector') private vehicleSelector: MatSelect;
  @ViewChild('densitySelector') private densitySelector: MatSelect;

  private trafficMarkers: TrafficMarker[];
  private trafficLayerGroup: LayerGroup = layerGroup();
  private map: LeafletMap;

  years: string[] = ['2019', '2018', '2017', '2016', '2015', '2014'];
  vehicles: string[] = ['Car', 'Bike'];

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

  public constructor(private titleService: Title, private http: HttpClient) {
    titleService.setTitle('Portland Traffic Reform');
  }

  updateDisplayedTrafficMarkers(): void {
    this.map.removeLayer(this.trafficLayerGroup);
    this.trafficLayerGroup.clearLayers();

    const zoom: number = this.areaSelector.empty ? 11 : 12.5;
    const year: string = this.yearSelector.empty ? '-' : this.yearSelector.value;
    const bikesOnly: boolean = this.vehicleSelector.value === 'Bike';

    for (const trafficMarker of this.trafficMarkers) {
      const selectedDensity: DensityInfo = this.densitySelector.empty ? this.DEFAULT_INTENSITY_RANGE : this.densitySelector.value;
      if (inDensityRange(trafficMarker.trafficDensity, selectedDensity) && trafficMarker.startDate.includes(year)) {
        if (bikesOnly === trafficMarker.isBikeMarker) {
          const vehicle = bikesOnly ? 'Bikes' : 'Cars';
          const icon = getDensityIconFromMarker(trafficMarker);

          marker(trafficMarker.coordinates, {riseOnHover: true, icon})
            .bindPopup(`Daily Volume: ${trafficMarker.trafficDensity} ${vehicle}`)
            .addTo(this.trafficLayerGroup);
        }
      }

      this.map.addLayer(this.trafficLayerGroup);
    }

    const coordinates: LatLngExpression = this.areaSelector.empty ? this.DEFAULT_COORDS : this.areaSelector.value.coordinates;
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
      this.trafficMarkers = getMarkersFromFeatures(trafficJson.features);

      this.updateDisplayedTrafficMarkers();
    });
  }
}
