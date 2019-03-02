import {Component, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect} from '@angular/material';
import {
  latLng,
  tileLayer,
  Map as LeafletMap,
  LatLngExpression,
  marker,
  layerGroup,
  LayerGroup,
  icon,
  Icon,
  MapOptions,
  PointExpression,
  Layer
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {Feature, FeatureCollection} from 'geojson';

interface FlowRange {
  readonly min: number;
  readonly max: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private ICON_SIZE: PointExpression = [10, 10];
  private IMAGES_DIR = '../../assets/images/';
  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];
  private DEFAULT_FLOW: FlowRange = {min: 0, max: 100000};

objectKeys = Object.keys;

  @ViewChild('areaSelector') private areaSelector: MatSelect;
  @ViewChild('yearSelector') private yearSelector: MatSelect;
  @ViewChild('vehicleSelector') private vehicleSelector: MatSelect;
  @ViewChild('densitySelector') private densitySelector: MatSelect;

  years: string[] = ['2019', '2018', '2017', '2016', '2015', '2014'];
  vehicles: string[] = ['Car', 'Bike'];

  areas: {[area: string]: LatLngExpression} = {
    North: [45.6075, -122.7236],
    South: [45.4886, -122.6755],
    Northwest: [45.5586, -122.7609],
    Northeast: [45.5676, -122.6179],
    Southwest: [45.4849, -122.7116],
    Southeast: [45.4914, -122.5930]
  };

  densities: {[density: string]: FlowRange} = {
    High: {min: 4000, max: 100000},
    Medium: {min: 500, max: 4000},
    Low: {min: 0, max: 500}
  };

  private trafficFeatures: Feature[];
  private trafficLayerGroup: LayerGroup = layerGroup();
  private map: LeafletMap;

  private redIcon = icon({iconUrl: `${this.IMAGES_DIR}redMarker.png`, iconSize: this.ICON_SIZE});
  private orangeIcon = icon({iconUrl: `${this.IMAGES_DIR}orangeMarker.png`, iconSize: this.ICON_SIZE});
  private greenIcon = icon({iconUrl: `${this.IMAGES_DIR}greenMarker.png`, iconSize: this.ICON_SIZE});

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

  static getCoordinateFromFeature(feature: Feature): LatLngExpression {
    // The coordinates are reversed in the JSON.
    return (feature.geometry as any).coordinates.reverse() as LatLngExpression;
  }

  static isBikeFeature(feature: Feature): boolean {
    return feature.properties.ExceptType === 'Bike Count' || feature.properties.Comment === 'ONLY BIKES';
  }

  inFlowRange(feature: Feature): boolean {
    const flowRange = this.densitySelector.empty ? this.DEFAULT_FLOW : this.densities[this.densitySelector.value];
    const trafficVolume = feature.properties.ADTVolume;
    return trafficVolume >= flowRange.min && trafficVolume <= flowRange.max;
  }

  getFeatureIcon(feature: Feature): Icon {
    const trafficVolume: number = feature.properties.ADTVolume;

    if (trafficVolume > 5000) {
      return this.redIcon;
    }

    if (trafficVolume > 1000) {
      return this.orangeIcon;
    }

    return this.greenIcon;
  }

  filterData(): void {
    this.map.removeLayer(this.trafficLayerGroup);
    this.trafficLayerGroup.clearLayers();

    const zoom: number = this.areaSelector.empty ? 11 : 12.5;
    const year: string = this.yearSelector.empty ? '-' : this.yearSelector.value;
    const bikesOnly: boolean = this.vehicleSelector.value === 'Bike';

    for (const feature of this.trafficFeatures) {
      const featureCoordinates = HomeComponent.getCoordinateFromFeature(feature);
      const featureIcon = this.getFeatureIcon(feature);

      if (this.inFlowRange(feature) && feature.properties.StartDate.includes(year)) {
        if (bikesOnly === HomeComponent.isBikeFeature(feature)) {
          const vehicle = bikesOnly ? 'Bikes' : 'Cars';
          const trafficMarker = marker(featureCoordinates, {riseOnHover: true, icon: featureIcon})
            .bindPopup(`Daily Volume: ${feature.properties.ADTVolume} ${vehicle}`);

          trafficMarker.addTo(this.trafficLayerGroup);
        }
      }

      this.map.addLayer(this.trafficLayerGroup);
    }

    const coordinates = this.areaSelector.empty ? this.DEFAULT_COORDS : this.areas[this.areaSelector.value];
    this.map.flyTo(coordinates, zoom);
  }

  clearFilters(): void {
    this.areaSelector.value = '';
    this.yearSelector.value = '';
    this.vehicleSelector.value = '';
    this.densitySelector.value = '';

    this.filterData();
  }

  /**
   * Initialize Leaflet map.
   * @param map The Leaflet map to initialize.
   */
  onMapReady(map: LeafletMap): void {
    this.map = map;

    const TRAFFIC_URL = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    this.http.get(TRAFFIC_URL).subscribe((trafficJson: FeatureCollection) => {
      this.trafficFeatures = trafficJson.features;
      this.filterData();
    });
  }
}
