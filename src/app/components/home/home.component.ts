import {Component, ViewChild, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect, MatTabChangeEvent, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {
  latLng,
  LatLngExpression,
  Map as LeafletMap,
  MapOptions,
  Marker,
  marker,
  tileLayer,
  LeafletEvent,
  layerGroup,
  Layer,
  LayerGroup,
  LatLngBounds,
  latLngBounds,
  rectangle,
  DivIcon,
  divIcon
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
// import {Http, ResponseContentType, Jsonp, Headers} from '@angular/http'
import {FeatureCollection} from 'geojson';
import {DensityInfo, TrafficMarker, PlanMarker} from './home.component.interfaces';
import {
  getLeafletMarkerFromTrafficMarker,
} from './home.component.functions';
import {TrafficLocation, VehicleType} from './home.component.enums';
import {DENSITIES, RED_ICON, GREEN_ICON, ORANGE_ICON, HOUSE_ICON, DEFAULT_ICON} from './home.component.constants';
import {map, startWith, filter} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {sha512} from 'js-sha512';

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

  myControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  private loggedIn: boolean;

  private addrReqInProg: boolean = false
  private currentFilter: String = ""

  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];
  private DEFAULT_INTENSITY_RANGE: DensityInfo = {min: 0, max: 100000};

  private allTrafficMarkers: TrafficMarker[];
  private allPlanMarkers: PlanMarker[];
  private leafletMarkers: Marker[] = [];
  private trafficLayer: LayerGroup = new LayerGroup();
  private houseLayer: LayerGroup = new LayerGroup();
  private map: LeafletMap;
  private heatMap: LayerGroup = new LayerGroup();
  private priceLayer: LayerGroup = new LayerGroup();
  private zindexMarker: {name: String, zindex: number, lat: number, lng: number}[] = [];
  private showPrices: boolean = false;
  private showTraffic: boolean = true;

  // Fields accessed by the HTML (template).
  public objectKeys = Object.keys;
  public densities = ['Any', 'High', 'Medium', 'Low'];
  public years: string[] = ['Any', '2019', '2018', '2017', '2016', '2015', '2014'];
  public vehicles: string[] = Object.values(VehicleType);
  public areas: {[location: string]: LatLngExpression} = {
    ["Any"]: this.DEFAULT_COORDS,
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
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 11,
    center: latLng(this.DEFAULT_COORDS)
  };

  public constructor(private titleService: Title, private http: HttpClient, private cookie: CookieService) {
    titleService.setTitle('Portland Housing Traffic Hotspots');
    this.loggedIn = !this.cookie.check('authenticated');
  }

  private updateLeafletMapLocation(): void {
    const coordinates = this.areaSelector.empty ? this.DEFAULT_COORDS : this.areaSelector.value;
    const zoom = this.areaSelector.empty ? 11 : this.areaSelector.value == this.DEFAULT_COORDS ? 11 : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  private updateDisplayedLeafletMarkers(): void {
    this.currentFilter = "";
    var justYear = " where"
    var density = this.densitySelector.value == "Medium" ? 'med' : this.densitySelector.value;
    if(!this.densitySelector.empty && this.densitySelector.value != "Any") {
      this.currentFilter = " where level='" + density + "'"
      if(!this.yearSelector.empty && this.yearSelector.value != "Any") {
        justYear = ""
        this.currentFilter = this.currentFilter + " and"
      }
    }
    if(!this.yearSelector.empty && this.yearSelector.value != "Any") {
      this.currentFilter = this.currentFilter + justYear + " date='" + this.yearSelector.value + "'"
    }

    this.trafficLayer.clearLayers();
    var command = "select * from traffic" + this.currentFilter
    this.http.post('/api', {command:command}).subscribe((data: any[]) => {
      data.map(trafficMarker => {
        const leafletMarker = getLeafletMarkerFromTrafficMarker(trafficMarker);
        this.trafficLayer.addLayer(leafletMarker);
      })
      this.map.addLayer(this.trafficLayer);
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
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

  /**
   * Initialize Leaflet map.
   * @param map The Leaflet map to initialize.
   */
  public onMapReady(map: LeafletMap): void {
    this.map = map;
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

  public updateOptions(e: KeyboardEvent) {
    if(!this.addrReqInProg && ((e.keyCode >= 48 && e.keyCode <=57) || (e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode == 32 || e.keyCode == 8)) {
      this.addrReqInProg = true
      const value = (<HTMLInputElement>document.getElementById("addressSearch")).value
      var command = "select address from address where `address` regexp '^" + value + ".*' limit 5"
      const DATA_URL = '/api'
      var newOptions: string[] = []
      this.http.post(DATA_URL, {command:command}).subscribe((addresses: any[]) => {
        for(var option of addresses) {
          newOptions.push(option.address)
        }
        this.options = newOptions;
        this.addrReqInProg = false
      }, (error: any) => {
        this.options = ['Error, cannot autocomplete']
        this.addrReqInProg = false
      })
    }
  }

  public getZestimate() {
    const value = (<HTMLInputElement>document.getElementById("addressSearch")).value
    var address = ""
    for(var word of value.split(" ")) {
      address = address + "+" + word
    }
    const url = "/webservice/GetSearchResults.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&address="+address+"&citystatezip=Portland%2C+OR"
    this.http.get(url, {responseType: 'text'}).subscribe((zillowXML) => {
      var zestElement: HTMLElement = document.getElementById("zestimate")
      
      if(zillowXML.includes('Error')) {
        zestElement.textContent = "Zestimate: N/A"
      }
      else {
        var start = zillowXML.indexOf("<amount currency=") + 23
        var end = zillowXML.indexOf("</amount>")
        var zestimate = zillowXML.substring(start, end)
        if(zestimate.length == 0) {
          zestElement.textContent = "Zestimate: N/A"
        }
        else {
          for(var i=zestimate.length-3; i>0; i-=3) {
            zestimate = zestimate.substring(0, i) + "," + zestimate.substring(i)
          }
          zestElement.textContent = "Zestimate: $" + zestimate
        }
      }
    }, (error: any) => {
      alert("Cannot get Zestimate. Check that you are connected to the internet.")
    });

    const DATA_URL = '/api'
    var command = "select * from address where address='" + value + "'"
    this.http.post(DATA_URL, {command:command}).subscribe((info: any[]) => {
      this.houseLayer.clearLayers()
      if(info.length == 0) {
        document.getElementById("errorMess").style.display = "block";
        document.getElementById("infoCard").style.display = "none";
      }
      else {
        document.getElementById("errorMess").style.display = "none";
        document.getElementById("infoCard").style.display = "block";
        document.getElementById("curAddress").textContent = info[0].address
        document.getElementById("cityzip").textContent = "Portland, OR " + info[0].zip
        const coords: LatLngExpression = [info[0].lat, info[0].lng];
        const icon = HOUSE_ICON
        this.houseLayer.addLayer(marker(coords, {riseOnHover: true, icon}).bindPopup(info[0].address))
        var corner1 = latLng(info[0].lat-0.0075, info[0].lng-0.0075)
        var corner2 = latLng(info[0].lat+0.0075, info[0].lng+0.0075)
        var setBounds = latLngBounds(corner1, corner2)
        this.map.flyToBounds(setBounds, {maxZoom: 15});
        this.getTrafficInfo(info[0].lat-0.0075, info[0].lat+0.0075, info[0].lng-0.0075, info[0].lng+0.0075)
      }
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
  }

  public getTrafficInfo(lat1: any, lat2: any, lng1: any, lng2: any) {
    var andStatement = this.currentFilter.length == 0 ? " where" : " and"
    var command = "select volume from traffic" + this.currentFilter + andStatement + " lat>" + lat1 + " and lat<" + lat2 + " and lng>" + lng1 + " and lng<" + lng2
    this.http.post('/api', {command:command}).subscribe((info: any[]) => {
      var sum: number = 0
      var amount: number = 0.000000000001
      for(var point of info) {
        sum += point.volume
        amount += 1
      }
      const average = Math.round(sum/amount);
      var level = average < 1000 ? "Low" : average < 5000 ? "Medium" : "High"
      document.getElementById("trafficLevel").textContent = "Traffic Level: " + level
      document.getElementById("trafficVolume").textContent = "Average traffic flow of area: " + average + " cars per day"
      this.getProjects(lat1, lat2, lng1, lng2)
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
  }

  public getProjects(lat1: any, lat2: any, lng1: any, lng2: any) {
    var command = "select * from tsp where lat>" + lat1 + " and lat<" + lat2 + " and lng>" + lng1 + " and lng<" + lng2
    this.http.post('/api', {command:command}).subscribe((info: any[]) => {
      const icon = DEFAULT_ICON
      var projectString = ""
      var count = 0
      for(let project of info) {
        count += 1
        var coords: LatLngExpression = [project.lat, project.lng];
        this.houseLayer.addLayer(marker(coords, {riseOnHover: true, icon}).bindPopup(project.name))
        projectString = projectString + "Project Name: " + project.name + "\nProject Description: " + project.description + "\n\n"
      }
      this.map.addLayer(this.houseLayer)
      document.getElementById("tspProjects").textContent = projectString
      document.getElementById("projects").textContent = count + " TSP Projects"
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
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

  // Source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  public componentToHex(c: number) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  public rgbToHex(r: number, g: number, b: number) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }
}