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
  tileLayer,
  LatLngBounds,
  rectangle,
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {
  alphaNumericSpacebarOrBackspaceSelected,
  getLeafletMarkerFromTrafficMarker,
  valueSelectedBesidesAny
} from './home.component.functions';
import {TrafficLocation, VehicleType} from './home.component.enums';
import {Observable} from 'rxjs';
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
  filteredOptions: Observable<string[]>;

  private loggedIn: boolean;
  private selectedTab = 0;

  private currentFilter: String = ""

  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];
  private MAX_BOUNDS: LatLngBounds = latLngBounds(latLng(45.5122-0.5, -122.6587-0.5), latLng(45.5122+0.5, -122.6587+0.5))

  private trafficLayer: LayerGroup = new LayerGroup();
  private houseLayer: LayerGroup = new LayerGroup();
  private map: LeafletMap;
  private heatMap: LayerGroup = new LayerGroup();
  private priceLayer: LayerGroup = new LayerGroup();
  private zindexMarker: {name: String, zindex: number, lat: number, lng: number}[] = [];
  private showPrices: boolean = false;
  private showTraffic: boolean = true;
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
    minZoom: 10,
    maxBounds: this.MAX_BOUNDS,
    maxBoundsViscosity: 1.0,
    center: latLng(this.DEFAULT_COORDS)
  };

  public constructor(private titleService: Title, private http: HttpClient, private cookie: CookieService) {
    titleService.setTitle('Portland Housing Traffic Hotspots');
    this.loggedIn = !this.cookie.check('authenticated');
  }

  ngOnInit() {
    if(this.cookie.check('address')) {
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
    //this.map.setMaxBounds(this.map.getBounds());
    //let iconContent = "<strong style=\"background-color:rgba(255, 0, 255, 0.35);color:#000000;font-size:3em;padding:0em 0.2em 0em 0.2em;border-radius:0.25em;\">$1,200,450</strong>"
    //const newIcon = divIcon({className: 'zindex', html: iconContent});
    //marker(this.DEFAULT_COORDS, {icon: newIcon}).addTo(this.map);
    const url = '/webservice/GetRegionChildren.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&state=or&city=portland&childtype=neighborhood'
    this.http.get(url, {responseType: 'text'}).subscribe((zillowXML) => {
      const regions = zillowXML.split("<region>").splice(2);
      for(let region of regions) {
        if(region.indexOf("zindex currency=") == -1){
          continue;
        }
        const zStart = region.indexOf("zindex currency=") + 22
        const zEnd = region.indexOf("</zindex>")
        var zIndex = +region.substring(zStart, zEnd)

        // for(var i=zIndex.length-3; i>0; i-=3) {
        //   zIndex = zIndex.substring(0, i) + "," + zIndex.substring(i)
        // }

        const nStart = region.indexOf("<name>") + 6
        const nEnd = region.indexOf("</name>")
        const regionName = region.substring(nStart, nEnd)

        const latStart = region.indexOf("<latitude>") + 10
        const latEnd = region.indexOf("</latitude>")
        const latitude = +region.substring(latStart, latEnd)

        const lngStart = region.indexOf("<longitude>") + 11
        const lngEnd = region.indexOf("</longitude>")
        const longitude = +region.substring(lngStart, lngEnd)

        this.zindexMarker.push({name: regionName, zindex: zIndex, lat: latitude, lng: longitude});
      }
      this.updateHeatMap();
    });
    //this.clearFiltersAndUpdateMap();
  }

  public autocompleteAddress(e: KeyboardEvent) {
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

  // public getZestimate() {
  //   const value = (<HTMLInputElement>document.getElementById("addressSearch")).value
  //   var address = ""
  //   for(var word of value.split(" ")) {
  //     address = address + "+" + word
  //   }
  //   const url = "/webservice/GetSearchResults.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&address="+address+"&citystatezip=Portland%2C+OR"
  //   this.http.get(url, {responseType: 'text'}).subscribe((zillowXML) => {
  //     var zestElement: HTMLElement = document.getElementById("zestimate")
      
  //     if(zillowXML.includes('Error')) {
  //       zestElement.textContent = "Zestimate: N/A"
  //     }
  //     else {
  //       var start = zillowXML.indexOf("<amount currency=") + 23
  //       var end = zillowXML.indexOf("</amount>")
  //       var zestimate = zillowXML.substring(start, end)
  //       if(zestimate.length == 0) {
  //         zestElement.textContent = "Zestimate: N/A"
  //       }
  //       else {
  //         for(var i=zestimate.length-3; i>0; i-=3) {
  //           zestimate = zestimate.substring(0, i) + "," + zestimate.substring(i)
  //         }
  //         zestElement.textContent = "Zestimate: $" + zestimate
  //       }
  //     }
  //   }, (error: any) => {
  //     alert("Cannot get Zestimate. Check that you are connected to the internet.")
  //   });

  //   const DATA_URL = '/api'
  //   var command = "select * from address where address='" + value + "'"
  //   this.http.post(DATA_URL, {command:command}).subscribe((info: any[]) => {
  //     this.houseLayer.clearLayers()
  //     if(info.length == 0) {
  //       document.getElementById("errorMess").style.display = "block";
  //       document.getElementById("infoCard").style.display = "none";
  //     }
  //     else {
  //       document.getElementById("errorMess").style.display = "none";
  //       document.getElementById("infoCard").style.display = "block";
  //       document.getElementById("curAddress").textContent = info[0].address
  //       document.getElementById("cityzip").textContent = "Portland, OR " + info[0].zip
  //       const coords: LatLngExpression = [info[0].lat, info[0].lng];
  //       const icon = HOUSE_ICON
  //       this.houseLayer.addLayer(marker(coords, {riseOnHover: true, icon}).bindPopup(info[0].address))
  //       var corner1 = latLng(info[0].lat-0.0075, info[0].lng-0.0075)
  //       var corner2 = latLng(info[0].lat+0.0075, info[0].lng+0.0075)
  //       var setBounds = latLngBounds(corner1, corner2)
  //       this.map.flyToBounds(setBounds, {maxZoom: 15});
  //       this.getTrafficInfo(info[0].lat-0.0075, info[0].lat+0.0075, info[0].lng-0.0075, info[0].lng+0.0075)
  //     }
  //   }, (error: any) => {
  //     alert("Cannot get information. Check that you are connected to the internet.")
  //   })
  // }

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

  public saveSearch() {
    const address = document.getElementById('curAddress').textContent;
    const user = sha512(this.cookie.get('authenticated'));
    const level = document.getElementById("trafficLevel").textContent;
    const volume = document.getElementById("trafficVolume").textContent;
    const command = "insert ignore into saves (user, address, level, volume) VALUES ('" + user + "', '" + address + "', '" + level +"', '" + volume +"')"
    this.http.post('/api', {command:command}).subscribe((data: any[]) => {
      alert('Address has been saved to account!');
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
  }

  public showSearch() {
    if(this.selectedTab === 1 && this.cookie.check('address')) {
      //(<HTMLInputElement>document.getElementById("addressSearch")).value = this.cookie.get('address');
      const searchBar: HTMLInputElement = document.getElementById('addressSearch') as HTMLInputElement;
      searchBar.value = this.cookie.get('address');
      this.cookie.delete('address');
      this.getZestimate();
      //this.getZestimate();
    }
  }

  public updateHeatMap() {
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
    let buckets: {sum: number, count: number}[][] = [];
    let priceBuckets: {sum: number, count: number}[][] = [];

    for(let i=0; i<numBuckets; i++) {
      buckets[i] = []
      priceBuckets[i] = []
      for(let j=0; j<numBuckets; j++) {
        buckets[i][j] = {sum: 0, count: 0};
        priceBuckets[i][j] = {sum: 0, count: 0};
      }
    }
    if(this.showPrices) {
      for(let i=0; i<this.zindexMarker.length; i++) {
        if(this.zindexMarker[i].lat > bottomBound && this.zindexMarker[i].lat < topBound && this.zindexMarker[i].lng > leftBound && this.zindexMarker[i].lng < rightBound) {
          var lngBucket = this.zindexMarker[i].lng - leftBound;
          lngBucket = Math.floor(lngBucket / bucketWidth);
          var latBucket = this.zindexMarker[i].lat - bottomBound;
          latBucket = Math.floor(latBucket / bucketHeight);
          priceBuckets[lngBucket][latBucket].sum += this.zindexMarker[i].zindex;
          priceBuckets[lngBucket][latBucket].count += 1;
        }
      }
  
      let leftRect = leftBound
      for(let i=0; i<numBuckets; i++) {
        let bottomRect = bottomBound
        for(let j=0; j<numBuckets; j++) {
          if(priceBuckets[i][j].count != 0) {
            var average = priceBuckets[i][j].sum / priceBuckets[i][j].count;
            //const opacity = average > 700000 ? 0.5 : average / 1400000;
            //const color = this.rgbToHex(255, 46, 0);
            average = average >= 700000 ? 510 : Math.round((average - 100000)/(600000/510))
            const redValue = average <= 255 ? 0 : average - 255;
            const greenValue = average >= 255 ? 0 : 255 - average;
            const color = this.rgbToHex(redValue, greenValue, 255);
            rectangle(latLngBounds(latLng(bottomRect + bucketHeight, leftRect), latLng(bottomRect, leftRect + bucketWidth)), {color: color, weight: 0, fillOpacity: 0.35}).addTo(this.priceLayer);
          }
          bottomRect += bucketHeight
        }
        leftRect += bucketWidth
      }
      this.priceLayer.addTo(this.map);
    }
    
    if(this.showTraffic) {
      let command = "select * from traffic where lat>" + bottomBound + " and lat<" + topBound + " and lng>" + leftBound + " and lng<" + rightBound;
      this.http.post('/api', {command:command}).subscribe((info: any[]) => {
        for(let point of info) {
          var lngBucket = point.lng - leftBound;
          lngBucket = Math.floor(lngBucket / bucketWidth);
          var latBucket = point.lat - bottomBound;
          latBucket = Math.floor(latBucket / bucketHeight);
          buckets[lngBucket][latBucket].sum += point.volume;
          buckets[lngBucket][latBucket].count += 1;
        }

        let leftRect = leftBound
        for(let i=0; i<numBuckets; i++) {
          let bottomRect = bottomBound
          for(let j=0; j<numBuckets; j++) {
            if(buckets[i][j].count != 0) {
              var average = buckets[i][j].sum / buckets[i][j].count;
              average = average > 5100 ? 510 : Math.round(average / 10);
              const redValue = average >= 255 ? 255 : average;
              const greenValue = average <= 255 ? 255 : 510 - average;
              const color = this.rgbToHex(redValue, greenValue, 0);
              //const opacity = average > 510 ? 0.5 : average / 1020;
              //const color = this.rgbToHex(0, 140, 255);
              rectangle(latLngBounds(latLng(bottomRect + bucketHeight, leftRect), latLng(bottomRect, leftRect + bucketWidth)), {color: color, weight: 0, fillOpacity: 0.35}).addTo(this.heatMap);
            }
            bottomRect += bucketHeight
          }
          leftRect += bucketWidth
        }
        this.heatMap.addTo(this.map)
      }, (error: any) => {
        alert("Cannot get information. Check that you are connected to the internet.")
      });
    }    
  }

  public toggleShowPrices() {
    this.showPrices = !this.showPrices;
  }

  public toggleShowTraffic() {
    this.showTraffic = !this.showTraffic;
  }

  public toggleData() {
    this.showTraffic = !this.showTraffic;
    this.showPrices = !this.showPrices;
  }

  // Source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  public componentToHex(c: number) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  public rgbToHex(r: number, g: number, b: number) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }
}
