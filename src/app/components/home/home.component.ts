import {Component, OnInit, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect} from '@angular/material';
import {FormControl} from '@angular/forms';
import {latLng, latLngBounds, LatLngExpression, LayerGroup, Map as LeafletMap, MapOptions, marker, tileLayer} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {
  alphaNumericSpacebarOrBackspaceSelected,
  getBounds,
  getColorForPriceBucket,
  getColorForTrafficBucket,
  getLayer,
  getPriceBucketArray,
  getTrafficBucketArray,
  getTrafficLevelFromAverageVolume,
  getZestimateValue,
  getZillowNeighborhoods
} from './home.component.functions';
import {TrafficLocation} from './home.component.enums';
import {CookieService} from 'ngx-cookie-service';
import {sha512} from 'js-sha512';
import {DEFAULT_COORDS, DEFAULT_ICON, HOUSE_ICON, MAX_BOUNDS} from './home.component.constants';
import {displayGeneralErrorMessage, getSqlSelectCommand} from '../../../helpers/helpers.functions';
import {IAddress, ITrafficData, ITspProject, IZillowNeighborhood} from './home.component.interfaces';
import {parseString} from 'xml2js';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Used in the HTML template to store string values.
  public cityZipTextContent: string;
  public currentAddressTextContent: string;
  public zestimateTextContent: string;
  public trafficLevelTextContent: string;
  public trafficVolumeTextContent: string;
  public tspProjectsTextContent: string;
  public projectsTextContent: string;
  public autocompleteFormControl = new FormControl();
  public options: string[] = [];
  // Boolean flags that are used in the form template.
  public loggedOut: boolean;
  public errorMessageVisible = false;
  public infoCardVisible = false;
  // Used for the selection dialogs.
  public objectKeys = Object.keys;
  public densities = ['Any', 'High', 'Medium', 'Low'];
  public years: string[] = ['Any', '2019', '2018', '2017', '2016', '2015', '2014'];
  public areas: { [location: string]: LatLngExpression } = {
    [TrafficLocation.Any]: DEFAULT_COORDS,
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
    minZoom: 10,
    maxBounds: MAX_BOUNDS,
    maxBoundsViscosity: 1.0,
    center: latLng(DEFAULT_COORDS)
  };
  @ViewChild('areaSelector') private areaSelector: MatSelect;
  @ViewChild('yearSelector') private yearSelector: MatSelect;
  @ViewChild('densitySelector') private densitySelector: MatSelect;
  private selectedTab = 0;
  private houseLayer: LayerGroup = new LayerGroup();
  private heatMapLayer: LayerGroup = new LayerGroup();
  private priceLayer: LayerGroup = new LayerGroup();
  private map: LeafletMap;
  private zillowNeighborhoods: IZillowNeighborhood[] = [];
  private showPrices = false;
  private showTraffic = true;

  public constructor(private titleService: Title, private http: HttpClient, private cookie: CookieService) {
    titleService.setTitle('Portland Housing Traffic Hotspots');
    this.loggedOut = !this.cookie.check('authenticated');
  }

  ngOnInit(): void {
    if (this.cookie.check('address')) {
      this.selectedTab = 1;
    }
  }

  public updateLeafletMapLocation(): void {
    const coordinates = this.areaSelector.empty ? DEFAULT_COORDS : this.areaSelector.value;
    const zoom = this.areaSelector.empty ? 11 : this.areaSelector.value === DEFAULT_COORDS ? 11 : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  public clearFiltersAndUpdateMap(): void {
    this.areaSelector.value = '';
    this.yearSelector.value = '';
    this.densitySelector.value = '';

    this.updateLeafletMapLocation();
  }

  public onMapReady(map: LeafletMap): void {
    this.map = map;
    this.http.get(
      '/webservice/GetRegionChildren.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&state=or&city=portland&childtype=neighborhood',
      {responseType: 'text'}).subscribe((zillowXml) => {
      parseString(zillowXml, (err, zillowJson) => this.zillowNeighborhoods.push(...getZillowNeighborhoods(zillowJson)));
      this.updateHeatMap();
    });
  }

  public autocompleteAddress(e: KeyboardEvent): void {
    if (alphaNumericSpacebarOrBackspaceSelected(e.keyCode)) {
      this.http.post(
        '/api', {
          command: getSqlSelectCommand(
            {
              whatToSelect: 'address', tableToSelectFrom: 'address', whereStatements: [
                `\`address\` regexp '^${this.autocompleteFormControl.value}.*' LIMIT 5`
              ]
            }
          )
        }).subscribe((addresses: IAddress[]) => this.options = addresses.map(x => x.address),
        () => this.options = ['Error. Cannot autocomplete']
      );
    }
  }

  public getZestimate(): void {
    const addressSearchValue = this.autocompleteFormControl.value;
    const address = addressSearchValue.split(' ').join('+');

    this.http.get(
      `/webservice/GetSearchResults.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&address=${address}&citystatezip=Portland%2C+OR`,
      {responseType: 'text'}).subscribe((zillowXml) => {
        parseString(zillowXml, (err, zillowJson) => this.zestimateTextContent = `Zestimate: ${getZestimateValue(zillowJson)}`);
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

        const addressRequestSucceeded = Boolean(addresses.length);
        this.infoCardVisible = addressRequestSucceeded;
        this.errorMessageVisible = !addressRequestSucceeded;

        if (addresses.length) {
          this.currentAddressTextContent = addresses[0].address;
          this.cityZipTextContent = `Portland, OR ${addresses[0].zip}`;

          this.houseLayer.addLayer(
            marker([addresses[0].lat, addresses[0].lng], {riseOnHover: true, icon: HOUSE_ICON})
              .bindPopup(addresses[0].address)
          );

          const DELTA = 0.0075;
          this.map.flyToBounds(
            latLngBounds(
              latLng(addresses[0].lat - DELTA, addresses[0].lng - DELTA),
              latLng(addresses[0].lat + DELTA, addresses[0].lng + DELTA)
            ), {maxZoom: 15}
          );

          this.getTrafficInformation();
          this.getProjects(
            addresses[0].lat - DELTA,
            addresses[0].lat + DELTA,
            addresses[0].lng - DELTA,
            addresses[0].lng + DELTA
          );
        }
      }, () => displayGeneralErrorMessage()
    );
  }

  public getTrafficInformation(): void {
    this.http.post('/api', {
      command: getSqlSelectCommand({whatToSelect: 'volume', tableToSelectFrom: 'traffic', whereStatements: []})
    }).subscribe((volumeTrafficData: ITrafficData[]) => {
        let summedVolume = 0;
        let averageVolume = 0;

        if (volumeTrafficData.length) {
          summedVolume = volumeTrafficData.map(x => x.volume).reduce((a, b) => a + b);
          averageVolume = Math.round(summedVolume / volumeTrafficData.length);
        }

        this.trafficLevelTextContent = `Traffic Level: ${getTrafficLevelFromAverageVolume(averageVolume)}`;
        this.trafficVolumeTextContent = `Average traffic flow of area: ${averageVolume} cars per day`;
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
          return `Project Name: ${project.name}\nProject Description: ${project.description}\n\n`;
        }).join('');

        this.map.addLayer(this.houseLayer);
        this.tspProjectsTextContent = projectsDescription;
        this.projectsTextContent = `${projects.length} TSP Projects`;
      }, () => displayGeneralErrorMessage()
    );
  }

  public saveSearch(): void {
    const address = this.currentAddressTextContent;
    const user = sha512(this.cookie.get('authenticated'));
    const level = this.trafficLevelTextContent;
    const volume = this.trafficVolumeTextContent;

    this.http.post(
      '/api', {
        command: `INSERT ignore INTO saves (user, address, level, volume) VALUES ('${user}', '${address}', '${level}', '${volume}')`
      }).subscribe(
      () => alert('Address has been saved to account!'),
      () => displayGeneralErrorMessage()
    );
  }

  public showSearch(): void {
    if (this.selectedTab === 1 && this.cookie.check('address')) {
      this.autocompleteFormControl.setValue(this.cookie.get('address'));
      this.cookie.delete('address');
      this.getZestimate();
    }
  }

  public updateHeatMap(): void {
    const bounds = getBounds(this.map.getBounds());

    this.priceLayer.clearLayers();
    if (this.showPrices) {
      this.priceLayer = getLayer(getPriceBucketArray(this.zillowNeighborhoods, bounds), bounds, getColorForPriceBucket);
      this.priceLayer.addTo(this.map);
    }

    this.heatMapLayer.clearLayers();
    if (this.showTraffic) {
      this.http.post('/api', {
        command: getSqlSelectCommand({
          whatToSelect: '*', tableToSelectFrom: 'traffic', whereStatements: [
            `lat>${bounds.bottom}`, `lat<${bounds.top}`, `lng>${bounds.left}`, `lng<${bounds.right}`
          ]
        })
      }).subscribe((trafficData: ITrafficData[]) => {
        this.heatMapLayer = getLayer(getTrafficBucketArray(trafficData, bounds), bounds, getColorForTrafficBucket);
        this.heatMapLayer.addTo(this.map);
      }, () => displayGeneralErrorMessage());
    }
  }

  public toggleData(): void {
    this.showTraffic = !this.showTraffic;
    this.showPrices = !this.showPrices;
    this.updateHeatMap();
  }
}
