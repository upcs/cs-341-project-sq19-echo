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
  rectangle, LatLng,
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {alphaNumericSpacebarOrBackspaceSelected, rgbToHex} from './home.component.functions';
import {TrafficLocation} from './home.component.enums';
import {CookieService} from 'ngx-cookie-service';
import {sha512} from 'js-sha512';
import {DEFAULT_ICON, HOUSE_ICON} from './home.component.constants';
import {displayGeneralErrorMessage, getSqlSelectCommand} from '../../../helpers/helpers.functions';
import {IAddress, IBucket, ITrafficData, ITspProject, IZillowNeighborhood} from './home.component.interfaces';
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

  @ViewChild('areaSelector') private areaSelector: MatSelect;
  @ViewChild('yearSelector') private yearSelector: MatSelect;
  @ViewChild('densitySelector') private densitySelector: MatSelect;

  public autocompleteFormControl = new FormControl();
  public options: string[] = [];

  // Boolean flags that are used in the form template.
  public loggedOut: boolean;
  public errorMessageVisible = false;
  public infoCardVisible = false;

  private selectedTab = 0;

  private DEFAULT_COORDS: LatLng = latLng(45.5122, -122.6587);
  private BOUND_DELTA = 0.5;
  private MAX_BOUNDS: LatLngBounds = latLngBounds(
    latLng(this.DEFAULT_COORDS.lat - this.BOUND_DELTA, this.DEFAULT_COORDS.lng - this.BOUND_DELTA),
    latLng(this.DEFAULT_COORDS.lat + this.BOUND_DELTA, this.DEFAULT_COORDS.lng + this.BOUND_DELTA)
  );

  private houseLayer: LayerGroup = new LayerGroup();
  private map: LeafletMap;
  private heatMap: LayerGroup = new LayerGroup();
  private priceLayer: LayerGroup = new LayerGroup();
  private zillowNeighborhoods: IZillowNeighborhood[] = [];
  private showPrices = false;
  private showTraffic = true;

  // Used for the selection dialogs.
  public objectKeys = Object.keys;
  public densities = ['Any', 'High', 'Medium', 'Low'];
  public years: string[] = ['Any', '2019', '2018', '2017', '2016', '2015', '2014'];
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

  public updateLeafletMapLocation(): void {
    const coordinates = this.areaSelector.empty ? this.DEFAULT_COORDS : this.areaSelector.value;
    const zoom = this.areaSelector.empty ? 11 : this.areaSelector.value === this.DEFAULT_COORDS ? 11 : 12.5;
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

      parseString(zillowXml, (err, zillowJson) => {
        const zillowRegions = zillowJson['RegionChildren:regionchildren'].response[0].list[0].region;

        for (const region of zillowRegions) {
          const zIndex = region.zindex;
          if (zIndex === undefined) {
            continue;
          }

          this.zillowNeighborhoods.push({
            name: region.name[0],
            zindex: parseInt(zIndex[0]._, 10),
            lat: parseFloat(region.latitude[0]),
            lng: parseFloat(region.longitude[0])
          });
        }
      });

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
          this.zestimateTextContent += zestimateAmount !== undefined ? `$${parseInt(zestimateAmount, 10).toLocaleString()}` : 'N/A';
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
    this.http.post('/api', {command}).subscribe(
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
    this.heatMap.clearLayers();
    this.priceLayer.clearLayers();

    const topBound = this.map.getBounds().getNorth();
    const rightBound = this.map.getBounds().getEast();
    const bottomBound = this.map.getBounds().getSouth();
    const leftBound = this.map.getBounds().getWest();

    const NUM_BUCKETS = 10;
    const bucketWidth = (rightBound - leftBound) / NUM_BUCKETS;
    const bucketHeight = (topBound - bottomBound) / NUM_BUCKETS;

    const trafficBuckets: IBucket[][] = Array.from(
      {length: NUM_BUCKETS}, () => Array.from({length: NUM_BUCKETS}, () => ({sum: 0, count: 0}))
    );
    const priceBuckets: IBucket[][] = JSON.parse(JSON.stringify(trafficBuckets));

    if (this.showPrices) {
      for (const zMarker of this.zillowNeighborhoods) {
        if (zMarker.lat > bottomBound && zMarker.lat < topBound && zMarker.lng > leftBound && zMarker.lng < rightBound) {
          const lngBucket = Math.floor((zMarker.lng - leftBound) / bucketWidth);
          const latBucket = Math.floor((zMarker.lat - bottomBound) / bucketHeight);

          priceBuckets[lngBucket][latBucket].sum += zMarker.zindex;
          priceBuckets[lngBucket][latBucket].count += 1;
        }
      }

      let leftRect = leftBound;
      for (const buckets of priceBuckets) {
        let bottomRect = bottomBound;

        for (const priceBucket of buckets) {
          if (priceBucket.count !== 0) {
            let average = priceBucket.sum / priceBucket.count;
            average = average >= 700000 ? 510 : Math.round((average - 100000) / (600000 / 510));

            const redValue = average <= 255 ? 0 : average - 255;
            const greenValue = average >= 255 ? 0 : 255 - average;
            const color = rgbToHex(redValue, greenValue, 255);

            rectangle(
              latLngBounds(latLng(bottomRect + bucketHeight, leftRect), latLng(bottomRect, leftRect + bucketWidth)),
              {color, weight: 0, fillOpacity: 0.35}
            ).addTo(this.priceLayer);
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
          const lngBucket = Math.floor((point.lng - leftBound) / bucketWidth);
          const latBucket = Math.floor((point.lat - bottomBound) / bucketHeight);

          trafficBuckets[lngBucket][latBucket].sum += point.volume;
          trafficBuckets[lngBucket][latBucket].count += 1;
        }

        let leftRect = leftBound;
        for (let i = 0; i < NUM_BUCKETS; i++) {
          let bottomRect = bottomBound;

          for (let j = 0; j < NUM_BUCKETS; j++) {
            if (trafficBuckets[i][j].count !== 0) {
              let average = trafficBuckets[i][j].sum / trafficBuckets[i][j].count;
              average = average > 5100 ? 510 : Math.round(average / 10);

              const redValue = average >= 255 ? 255 : average;
              const greenValue = average <= 255 ? 255 : 510 - average;
              const color = rgbToHex(redValue, greenValue, 0);

              rectangle(
                latLngBounds(latLng(bottomRect + bucketHeight, leftRect), latLng(bottomRect, leftRect + bucketWidth)),
                {color, weight: 0, fillOpacity: 0.35}
              ).addTo(this.heatMap);
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
