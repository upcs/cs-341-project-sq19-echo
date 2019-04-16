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
import {
  alphaNumericSpacebarOrBackspaceSelected,
  getLeafletMarkerFromTrafficMarker,
  valueSelectedBesidesAny
} from './home.component.functions';
import {TrafficLocation, VehicleType} from './home.component.enums';
import {DEFAULT_ICON, HOUSE_ICON} from './home.component.constants';
import {displayGeneralErrorMessage, getSqlSelectCommand} from '../../../helpers/helpers.functions';
import {IAddress, ITrafficData, ITspProject} from './home.component.interfaces';
import {parseString} from 'xml2js';

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

  autocompleteFormControl = new FormControl();
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
      }).subscribe((trafficData: ITrafficData[]) => {
        trafficData.map(trafficMarker => {
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

    if (alphaNumericSpacebarOrBackspaceSelected(e.keyCode)) {
      this.addressRequestInProgress = true;
      this.http.post(
        '/api', {
          command: getSqlSelectCommand(
            {
              whatToSelect: 'address', tableToSelectFrom: 'address', whereStatements: [
                `\`address\` regexp '^${this.autocompleteFormControl.value}.*' LIMIT 5`
              ]
            }
          )
        }).subscribe((addresses: IAddress[]) => {
        this.options = addresses.map(x => x.address);
        this.addressRequestInProgress = false;
      }, () => {
        this.options = ['Error, cannot autocomplete'];
        this.addressRequestInProgress = false;
      });
    }
  }

  public getZestimate(): void {
    const addressSearchValue = this.autocompleteFormControl.value;
    const address = addressSearchValue.split(' ').join('+');

    this.zestimateTextContent = 'Zestimate: ';
    this.http.get(
      `/webservice/GetSearchResults.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&address=${address}&citystatezip=Portland%2C+OR`,
      {responseType: 'text'}).subscribe((zillowXml) => {
        parseString(zillowXml, (err, zillowJson) => {
          const zillowSearchResult = zillowJson['SearchResults:searchresults'];
          if (zillowSearchResult.message[0].code[0] !== '0') {
            this.zestimateTextContent += 'N/A';
            return;
          }

          const zestimateAmount = zillowSearchResult.response[0].results[0].result[0].zestimate[0].amount[0]._;
          this.zestimateTextContent += zestimateAmount !== undefined ? `$${zestimateAmount}` : 'N/A';
        });
      }, () => displayGeneralErrorMessage()
    );

    this.http.post(
      '/api',
      {
        command: getSqlSelectCommand(
          {whatToSelect: '*', tableToSelectFrom: 'address', whereStatements: [`address='${addressSearchValue}'`]}
        )
      }).subscribe((addresses: IAddress[]) => {
        this.houseLayer.clearLayers();

        document.getElementById('errorMessage').style.display = addresses.length ? 'none' : 'block';
        document.getElementById('infoCard').style.display = addresses.length ? 'block' : 'none';

        if (addresses.length) {
          this.currentAddressTextContent = addresses[0].address;
          this.cityZipTextContent = `Portland, OR ${addresses[0].zip}`;

          this.houseLayer.addLayer(
            marker([addresses[0].lat, addresses[0].lng], {riseOnHover: true, icon: HOUSE_ICON}).bindPopup(addresses[0].address)
          );

          const DELTA = 0.0075;
          this.map.flyToBounds(
            latLngBounds(
              latLng(addresses[0].lat - DELTA, addresses[0].lng - DELTA),
              latLng(addresses[0].lat + DELTA, addresses[0].lng + DELTA)
            ), {maxZoom: 15}
          );

          this.getTrafficInformation(
            addresses[0].lat - DELTA,
            addresses[0].lat + DELTA,
            addresses[0].lng - DELTA,
            addresses[0].lng + DELTA
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
    }).subscribe((volumeTrafficData: ITrafficData[]) => {
        let summedVolume = 0;
        let averageVolume = 0;

        if (volumeTrafficData.length) {
          summedVolume = volumeTrafficData.map(x => x.volume).reduce((a, b) => a + b);
          averageVolume = Math.round(summedVolume / volumeTrafficData.length);
        }

        const trafficLevel = averageVolume < 1000 ? 'Low' : averageVolume < 5000 ? 'Medium' : 'High';
        this.trafficLevelTextContent = `Traffic Level: ${trafficLevel}`;
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
      }).subscribe((projects: ITspProject[]) => {
        const projectsDescription = projects.map(project => {
          this.houseLayer.addLayer(marker(
            [project.lat, project.lng], {riseOnHover: true, icon: DEFAULT_ICON}).bindPopup(project.name)
          );
          return 'Project Name: ' + project.name + '\nProject Description: ' + project.description + '\n\n';
        }).join('');

        this.map.addLayer(this.houseLayer);
        this.tspProjectsTextContent = projectsDescription;
        this.projectsTextContent = `${projects.length} TSP Projects`;
      }, () => displayGeneralErrorMessage()
    );
  }
}
