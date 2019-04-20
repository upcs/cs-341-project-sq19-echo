import {Component, OnInit, ViewChild} from '@angular/core';
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
  tileLayer,
  LatLngBounds,
  rectangle,
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {
  alphaNumericSpacebarOrBackspaceSelected,
  getLeafletMarkerFromTrafficMarker, rgbToHex,
  valueSelectedBesidesAny
} from './home.component.functions';
import {TrafficLocation, VehicleType} from './home.component.enums';
import {CookieService} from 'ngx-cookie-service';
import {sha512} from 'js-sha512';
import {DEFAULT_ICON, HOUSE_ICON} from './home.component.constants';
import {displayGeneralErrorMessage, getSqlSelectCommand} from '../../../helpers/helpers.functions';
import {IAddress, ITrafficData, ITspProject} from './home.component.interfaces';
import {parseString} from 'xml2js';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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

  private loggedOut: boolean;
  private selectedTab = 0;

  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];
  private MAX_BOUNDS: LatLngBounds = latLngBounds(latLng(45.5122 - 0.5, -122.6587 - 0.5), latLng(45.5122 + 0.5, -122.6587 + 0.5));

  private trafficLayer: LayerGroup = new LayerGroup();
  private houseLayer: LayerGroup = new LayerGroup();
  private map: LeafletMap;
  private heatMap: LayerGroup = new LayerGroup();
  private priceLayer: LayerGroup = new LayerGroup();
  private zindexMarkers: { name: string, zindex: number, lat: number, lng: number }[] = [];
  private showPrices = false;
  private showTraffic = true;
  private filterWhereStatements: string[];

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
    minZoom: 10,
    maxBounds: this.MAX_BOUNDS,
    maxBoundsViscosity: 1.0,
    center: latLng(this.DEFAULT_COORDS)
  };

  public constructor(private titleService: Title, private http: HttpClient, private cookie: CookieService) {
    titleService.setTitle('Portland Housing Traffic Hotspots');
    this.loggedOut = !this.cookie.check('authenticated');
  }

  ngOnInit(): void {
    if (this.cookie.check('address')) {
      this.selectedTab = 1;
    }
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
    // this.houseLayer.clearLayers()
    // this.updateDisplayedLeafletMarkers();
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
    const url = '/webservice/GetRegionChildren.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&state=or&city=portland&childtype=neighborhood';
    this.http.get(url, {responseType: 'text'}).subscribe((zillowXML) => {
      const regions = zillowXML.split('<region>').splice(2);
      for (const region of regions) {
        if (region.indexOf('zindex currency=') === -1) {
          continue;
        }
        const zStart = region.indexOf('zindex currency=') + 22;
        const zEnd = region.indexOf('</zindex>');
        const zIndex = +region.substring(zStart, zEnd);

        const nStart = region.indexOf('<name>') + 6;
        const nEnd = region.indexOf('</name>');
        const regionName = region.substring(nStart, nEnd);

        const latStart = region.indexOf('<latitude>') + 10;
        const latEnd = region.indexOf('</latitude>');
        const latitude = +region.substring(latStart, latEnd);

        const lngStart = region.indexOf('<longitude>') + 11;
        const lngEnd = region.indexOf('</longitude>');
        const longitude = +region.substring(lngStart, lngEnd);

        this.zindexMarkers.push({name: regionName, zindex: zIndex, lat: latitude, lng: longitude});
      }
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
        }).subscribe((addresses: IAddress[]) => {
        this.options = addresses.map(x => x.address);
      }, () => {
        this.options = ['Error, cannot autocomplete'];
      });
    }
  }

  public getZestimate(): void {
    const addressSearchValue = (document.getElementById('addressSearch') as HTMLInputElement).value;
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

          let zestimateAmount = zillowSearchResult.response[0].results[0].result[0].zestimate[0].amount[0]._;
          for (let i = zestimateAmount.length - 3; i > 0; i -= 3) {
            zestimateAmount = zestimateAmount.substring(0, i) + ',' + zestimateAmount.substring(i);
          }
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
    // const whereStatements = this.filterWhereStatements.concat(
    //   [`lat>${minLatitude}`, `lat<${maxLatitude}`, `lng>${minLongitude}`, `lng<${maxLongitude}`]
    // );
    this.http.post('/api', {
      command: getSqlSelectCommand({whatToSelect: 'volume', tableToSelectFrom: 'traffic', whereStatements: []})
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

  public saveSearch(): void {
    const address = this.currentAddressTextContent;
    const user = sha512(this.cookie.get('authenticated'));
    const level = this.trafficLevelTextContent;
    const volume = this.trafficVolumeTextContent;
    const command = `INSERT ignore INTO saves (user, address, level, volume) VALUES ('${user}', '${address}', '${level}', '${volume}')`;
    this.http.post('/api', {command}).subscribe(() => {
        alert('Address has been saved to account!');
      }, () => displayGeneralErrorMessage()
    );
  }

  public showSearch(): void {
    if (this.selectedTab === 1 && this.cookie.check('address')) {
      const searchBar: HTMLInputElement = document.getElementById('addressSearch') as HTMLInputElement;
      searchBar.value = this.cookie.get('address');
      this.cookie.delete('address');
      this.getZestimate();
    }
  }

  public updateHeatMap(): void {
    this.heatMap.clearLayers();
    this.priceLayer.clearLayers();
    const bounds = this.map.getBounds();
    const topBound = bounds.getNorth();
    const rightBound = bounds.getEast();
    const bottomBound = bounds.getSouth();
    const leftBound = bounds.getWest();
    const numBuckets = 10;
    const bucketWidth = (rightBound - leftBound) / numBuckets;
    const bucketHeight = (topBound - bottomBound) / numBuckets;
    const buckets: { sum: number, count: number }[][] = [];
    const priceBuckets: { sum: number, count: number }[][] = [];

    for (let i = 0; i < numBuckets; i++) {
      buckets[i] = [];
      priceBuckets[i] = [];
      for (let j = 0; j < numBuckets; j++) {
        buckets[i][j] = {sum: 0, count: 0};
        priceBuckets[i][j] = {sum: 0, count: 0};
      }
    }
    if (this.showPrices) {
      for (const zindexMarker of this.zindexMarkers) {
        if (zindexMarker.lat > bottomBound && zindexMarker.lat < topBound &&
            zindexMarker.lng > leftBound && zindexMarker.lng < rightBound) {
          let lngBucket = zindexMarker.lng - leftBound;
          lngBucket = Math.floor(lngBucket / bucketWidth);
          let latBucket = zindexMarker.lat - bottomBound;
          latBucket = Math.floor(latBucket / bucketHeight);
          priceBuckets[lngBucket][latBucket].sum += zindexMarker.zindex;
          priceBuckets[lngBucket][latBucket].count += 1;
        }
      }

      let leftRect = leftBound;
      for (let i = 0; i < numBuckets; i++) {
        let bottomRect = bottomBound;
        for (let j = 0; j < numBuckets; j++) {
          if (priceBuckets[i][j].count !== 0) {
            let average = priceBuckets[i][j].sum / priceBuckets[i][j].count;
            average = average >= 700000 ? 510 : Math.round((average - 100000) / (600000 / 510));
            const redValue = average <= 255 ? 0 : average - 255;
            const greenValue = average >= 255 ? 0 : 255 - average;
            const color = rgbToHex(redValue, greenValue, 255);
            rectangle(latLngBounds(latLng(bottomRect + bucketHeight, leftRect), latLng(bottomRect, leftRect + bucketWidth)), {
              color,
              weight: 0,
              fillOpacity: 0.35
            }).addTo(this.priceLayer);
          }
          bottomRect += bucketHeight;
        }
        leftRect += bucketWidth;
      }
      this.priceLayer.addTo(this.map);
    }

    if (this.showTraffic) {
      const command = getSqlSelectCommand({
        whatToSelect: '*', tableToSelectFrom: 'traffic', whereStatements: [
          `lat>${bottomBound}`, `lat<${topBound}`, `lng>${leftBound}`, `lng<${rightBound}`
        ]
      });
      this.http.post('/api', {command}).subscribe((trafficData: ITrafficData[]) => {
        for (const point of trafficData) {
          let lngBucket = point.lng - leftBound;
          lngBucket = Math.floor(lngBucket / bucketWidth);
          let latBucket = point.lat - bottomBound;
          latBucket = Math.floor(latBucket / bucketHeight);
          buckets[lngBucket][latBucket].sum += point.volume;
          buckets[lngBucket][latBucket].count += 1;
        }

        let leftRect = leftBound;
        for (let i = 0; i < numBuckets; i++) {
          let bottomRect = bottomBound;
          for (let j = 0; j < numBuckets; j++) {
            if (buckets[i][j].count !== 0) {
              let average = buckets[i][j].sum / buckets[i][j].count;
              average = average > 5100 ? 510 : Math.round(average / 10);
              const redValue = average >= 255 ? 255 : average;
              const greenValue = average <= 255 ? 255 : 510 - average;
              const color = rgbToHex(redValue, greenValue, 0);
              rectangle(latLngBounds(latLng(bottomRect + bucketHeight, leftRect), latLng(bottomRect, leftRect + bucketWidth)), {
                color,
                weight: 0,
                fillOpacity: 0.35
              }).addTo(this.heatMap);
            }
            bottomRect += bucketHeight;
          }
          leftRect += bucketWidth;
        }
        this.heatMap.addTo(this.map);
      }, () => displayGeneralErrorMessage());
    }
  }

  public toggleData(): void {
    this.showTraffic = !this.showTraffic;
    this.showPrices = !this.showPrices;
    this.updateHeatMap();
  }
}
