import {Component, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect} from '@angular/material';
import {FormControl} from '@angular/forms';
import {
  latLng,
  latLngBounds,
  LatLngExpression,
  LayerGroup,
  Map as LeafletMap,
  MapOptions,
  marker,
  tileLayer
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {getLeafletMarkerFromTrafficMarker, valueSelectedBesidesAny} from './home.component.functions';
import {TrafficLocation, VehicleType} from './home.component.enums';
import {DEFAULT_ICON, HOUSE_ICON} from './home.component.constants';
import {displayGeneralErrorMessage, getSqlSelectCommand} from '../../../helpers/helpers.functions';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  cityZipTextContent: string;
  currentAddressTextContent: string;
  zestimateTextContent: string;
  trafficLevelTextContent: string;
  trafficVolumeTextContent: string;
  tspProjectsTextContent: string;
  projectsTextContent = 'TSP Projects';

  @ViewChild('areaSelector') private areaSelector: MatSelect;
  @ViewChild('yearSelector') private yearSelector: MatSelect;
  @ViewChild('vehicleSelector') private vehicleSelector: MatSelect;
  @ViewChild('densitySelector') private densitySelector: MatSelect;
  @ViewChild('addressSearch') private addressSearch: HTMLInputElement;

  myControl = new FormControl();
  options: string[] = [];

  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];

  private trafficLayer: LayerGroup = new LayerGroup();
  private houseLayer: LayerGroup = new LayerGroup();
  private map: LeafletMap;
  private filterWhereStatements: string[];
  private addressRequestInProgress = false;

  // Fields accessed by the HTML (template).
  public objectKeys = Object.keys;
  public densities = ['Any', 'High', 'Medium', 'Low'];
  public years: string[] = ['Any', '2019', '2018', '2017', '2016', '2015', '2014'];
  public vehicles: string[] = Object.values(VehicleType);
  public areas: { [location: string]: LatLngExpression } = {
    ['Any']: this.DEFAULT_COORDS,
    [TrafficLocation.North]: [45.6075, -122.7236],
    [TrafficLocation.South]: [45.4886, -122.6755],
    [TrafficLocation.Northwest]: [45.5586, -122.7609],
    [TrafficLocation.Northeast]: [45.5676, -122.6179],
    [TrafficLocation.Southwest]: [45.4849, -122.7116],
    [TrafficLocation.Southeast]: [45.4914, -122.5930]
  };

  // Used by the HTML/template to set Leaflet's options.
  public leafletOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {attribution: '&copy; OpenStreetMap contributors'})
    ],
    zoom: 11,
    center: latLng(this.DEFAULT_COORDS)
  };

  public constructor(private titleService: Title, private http: HttpClient) {
    titleService.setTitle('Portland Housing Traffic Hotspots');
  }

  private updateLeafletMapLocation(): void {
    const coordinates = this.areaSelector.empty ? this.DEFAULT_COORDS : this.areaSelector.value;
    const zoom = this.areaSelector.empty ? 11 : this.areaSelector.value === this.DEFAULT_COORDS ? 11 : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  private updateDisplayedLeafletMarkers(): void {
    this.filterWhereStatements = [];

    if (valueSelectedBesidesAny(this.densitySelector)) {
      const density = this.densitySelector.value === 'Medium' ? 'med' : this.densitySelector.value;
      this.filterWhereStatements.push(`level='${density}'`);
    }

    if (valueSelectedBesidesAny(this.yearSelector)) {
      this.filterWhereStatements.push(`date='${this.yearSelector.value}'`);
    }

    this.trafficLayer.clearLayers();

    this.http.post(
      '/api', {
        command: getSqlSelectCommand(
          {whatToSelect: '*', tableToSelectFrom: 'traffic', whereStatements: this.filterWhereStatements}
        )
      }).subscribe((data: any[]) => {
        data.map(trafficMarker => {
          const leafletMarker = getLeafletMarkerFromTrafficMarker(trafficMarker);
          this.trafficLayer.addLayer(leafletMarker);
        });
        this.map.addLayer(this.trafficLayer);
      }, () => displayGeneralErrorMessage()
    );
  }

  public updateMap(): void {
    this.houseLayer.clearLayers();
    this.updateDisplayedLeafletMarkers();
    this.updateLeafletMapLocation();
  }

  public clearFiltersAndUpdateMap(): void {
    this.areaSelector.value = '';
    this.yearSelector.value = '';
    this.densitySelector.value = '';

    this.updateMap();
  }

  public onMapReady(map: LeafletMap): void {
    this.map = map;
    this.clearFiltersAndUpdateMap();
  }

  public autocompleteAddress(e: KeyboardEvent): void {
    if (this.addressRequestInProgress || !e.keyCode) {
      return;
    }

    if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 32 || e.keyCode === 8) {
      this.addressRequestInProgress = true;
      const value = this.addressSearch.value;
      this.http.post(
        '/api', {
          command: getSqlSelectCommand(
            {whatToSelect: 'address', tableToSelectFrom: 'address', whereStatements: [`\`address\` regexp '^${value}.*' LIMIT 5`]}
          )
        }).subscribe((addresses: any[]) => {
        this.options = addresses.map(x => x.address);
        this.addressRequestInProgress = false;
      }, () => {
        this.options = ['Error, cannot autocomplete'];
        this.addressRequestInProgress = false;
      });
    }
  }

  public getZestimate(): void {
    const addressSearchValue = this.addressSearch.value;
    const address = addressSearchValue.split(' ').join('+');

    this.zestimateTextContent = 'Zestimate: ';
    this.http.get(
      `/webservice/GetSearchResults.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&address=${address}&citystatezip=Portland%2C+OR`,
      {responseType: 'text'}).subscribe((zillowXml) => {
        if (zillowXml.includes('Error')) {
          this.zestimateTextContent += 'N/A';
          return;
        }

        let zestimate = zillowXml.substring(zillowXml.indexOf('<amount currency=') + 23, zillowXml.indexOf('</amount>'));
        if (!zestimate.length) {
          this.zestimateTextContent += 'N/A';
          return;
        }

        for (let i = zestimate.length - 3; i > 0; i -= 3) {
          zestimate = zestimate.substring(0, i) + ',' + zestimate.substring(i);
        }

        this.zestimateTextContent += `$${zestimate}`;
      }, () => displayGeneralErrorMessage()
    );

    this.http.post(
      '/api',
      {
        command: getSqlSelectCommand(
          {whatToSelect: '*', tableToSelectFrom: 'address', whereStatements: [`address='${addressSearchValue}`]}
        )
      }).subscribe((info: any[]) => {
        this.houseLayer.clearLayers();

        document.getElementById('errorMess').style.display = info.length ? 'none' : 'block';
        document.getElementById('infoCard').style.display = info.length ? 'block' : 'none';

        if (info.length) {
          this.currentAddressTextContent = info[0].address;
          this.cityZipTextContent = `Portland, OR ${info[0].zip}`;

          this.houseLayer.addLayer(
            marker([info[0].lat, info[0].lng], {riseOnHover: true, icon: HOUSE_ICON}).bindPopup(info[0].address)
          );

          const DELTA = 0.0075;
          this.map.flyToBounds(
            latLngBounds(
              latLng(info[0].lat - DELTA, info[0].lng - DELTA),
              latLng(info[0].lat + DELTA, info[0].lng + DELTA)
            ), {maxZoom: 15}
          );

          this.getTrafficInformation(
            info[0].lat - DELTA,
            info[0].lat + DELTA,
            info[0].lng - DELTA,
            info[0].lng + DELTA
          );
        }
      }, () => displayGeneralErrorMessage()
    );
  }

  public getTrafficInformation(minLatitude: number, maxLatitude: number, minLongitude: number, maxLongitude: number): void {
    const whereStatements = this.filterWhereStatements.concat(
      [`lat>${minLatitude}`, `lat<${maxLatitude}`, `lng>${minLongitude}`, `lng<${maxLongitude}`]
    );
    this.http.post('/api', {
      command: getSqlSelectCommand({whatToSelect: 'volume', tableToSelectFrom: 'traffic', whereStatements})
    }).subscribe((info: any[]) => {
        let summedVolume = 0;
        let averageVolume = 0;

        if (info.length) {
          summedVolume = info.map(point => point.volume).reduce((a, b) => a + b);
          averageVolume = Math.round(summedVolume / info.length);
        }

        const level = averageVolume < 1000 ? 'Low' : averageVolume < 5000 ? 'Medium' : 'High';
        this.trafficLevelTextContent = `Traffic Level: ${level}`;
        this.trafficVolumeTextContent = `Average traffic flow of area: ${averageVolume} cars per day`;
        this.getProjects(minLatitude, maxLatitude, minLongitude, maxLongitude);
      }, () => displayGeneralErrorMessage()
    );
  }

  public getProjects(minLatitude: number, maxLatitude: number, minLongitude: number, maxLongitude: number): void {
    this.http.post(
      '/api', {
        command: getSqlSelectCommand({
          whatToSelect: '*', tableToSelectFrom: 'tsp', whereStatements: [
            `lat>${minLatitude}`, `lat<${maxLatitude}`, `lng>${minLongitude}`, `lng<${maxLongitude}`
          ]
        })
      }).subscribe((returnedInfo: any[]) => {
        const projectsDescription = returnedInfo.map(project => {
          this.houseLayer.addLayer(marker(
            [project.lat, project.lng], {riseOnHover: true, icon: DEFAULT_ICON}).bindPopup(project.name)
          );
          return 'Project Name: ' + project.name + '\nProject Description: ' + project.description + '\n\n';
        }).join('');

        this.map.addLayer(this.houseLayer);
        this.tspProjectsTextContent = projectsDescription;
        this.projectsTextContent = `${returnedInfo.length} TSP Projects`;
      }, () => displayGeneralErrorMessage()
    );
  }
}
