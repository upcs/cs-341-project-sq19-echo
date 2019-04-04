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
  latLngBounds
} from 'leaflet';
import {HttpClient} from '@angular/common/http';
// import {Http, ResponseContentType, Jsonp, Headers} from '@angular/http'
import {FeatureCollection} from 'geojson';
import {DensityInfo, TrafficMarker, PlanMarker} from './home.component.interfaces';
import {
  getLeafletMarkerFromTrafficMarker,
  getLeafletMarkerFromPlanMarker,
  getTrafficMarkersFromFeatures,
  getVehicleFilterFromVehicleSelectorValue,
  inDensityRange,
  markerValidForVehicleFilter,
  getPlanMarkersFromFeatures
} from './home.component.functions';
import {TrafficLocation, VehicleType} from './home.component.enums';
import {DENSITIES, RED_ICON, GREEN_ICON, ORANGE_ICON, HOUSE_ICON, DEFAULT_ICON} from './home.component.constants';
import {map, startWith, filter} from 'rxjs/operators';
import {Observable} from 'rxjs';

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

  public constructor(private titleService: Title, private http: HttpClient) {
    titleService.setTitle('Portland Housing Traffic Hotspots');
  }

  // private getRelevantMarkers(): TrafficMarker[] {
  //   const selectedDensity = this.densitySelector.empty ? this.DEFAULT_INTENSITY_RANGE : this.densitySelector.value;
  //   const selectedYear = this.yearSelector.empty ? '-' : this.yearSelector.value;
  //   const selectedVehicleFilter = getVehicleFilterFromVehicleSelectorValue(this.vehicleSelector.value);

  //   return this.allTrafficMarkers.filter(trafficMarker =>
  //     inDensityRange(trafficMarker.trafficDensity, selectedDensity) &&
  //     trafficMarker.startDate.includes(selectedYear) &&
  //     markerValidForVehicleFilter(trafficMarker, selectedVehicleFilter)
  //   );
  // }

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
    this.houseLayer.clearLayers()
    this.updateDisplayedLeafletMarkers();
    this.updateLeafletMapLocation();
  }

  // public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
  //   if(tabChangeEvent.tab.textLabel === "View Projects") {
  //     this.leafletMarkers.forEach(marker => this.map.removeLayer(marker));
  //     for(let marker of this.allPlanMarkers) {
  //       const leafletMarker = getLeafletMarkerFromPlanMarker(marker);
  //       this.leafletMarkers.push(leafletMarker)
  //       this.map.addLayer(leafletMarker)
  //     }

  //     let allMarkers = this.leafletMarkers;
  //     let planMarkers = this.allPlanMarkers;
  //     let tempMap = this.map;
  //     let trafficMarkers = this.allTrafficMarkers;
  //     for(let lmarker of this.leafletMarkers) {
  //       lmarker.on("click", function(e) {
  //         var selectedMarker;
  //         for(let marker of allMarkers) {
  //           if(marker.isPopupOpen()) {
  //             selectedMarker = marker;
  //             break;
  //           }
  //         }
          
  //         var infoMarker: PlanMarker;
  //         for(let pmarker of planMarkers) {
  //           var markerCoords = pmarker.coordinates.toString().split(",")
  //           if(markerCoords[0] == String(selectedMarker.getLatLng().lat) && markerCoords[1] == String(selectedMarker.getLatLng().lng)) {
  //             infoMarker = pmarker;
  //             break;
  //           }
  //         }

  //         var strBounds: String[] = infoMarker.coordinates.toString().split(",")
  //         var corner1 = latLng(+strBounds[0]-0.02, +strBounds[1]-0.02)
  //         var corner2 = latLng(+strBounds[0]+0.02, +strBounds[1]+0.02)
  //         var setBounds = latLngBounds(corner1, corner2)
  //         tempMap.flyToBounds(setBounds, {maxZoom: 15});
  //         var sum: number = 0;
  //         var amount: number = 0.0000000001;
  //         for(let tmarker of trafficMarkers) {
  //           if(setBounds.contains(tmarker.coordinates)) {
  //             if(tmarker.trafficDensity <= 1000) {
  //               tempMap.addLayer(marker(tmarker.coordinates, {riseOnHover: true, icon: GREEN_ICON}).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`))
  //             }
  //             else if(tmarker.trafficDensity <= 5000) {
  //               tempMap.addLayer(marker(tmarker.coordinates, {riseOnHover: true, icon: ORANGE_ICON}).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`))
  //             }
  //             else if(tmarker.trafficDensity > 5000) {
  //               tempMap.addLayer(marker(tmarker.coordinates, {riseOnHover: true, icon: RED_ICON}).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`))
  //             }
  //             sum = sum + tmarker.trafficDensity;
  //             amount = amount + 1;
  //           }
  //         }
  //         var averageLevel = Math.round(sum/amount);
  //         var level: String = averageLevel < 1000 ? "Low" : averageLevel < 5000 ? "Medium" : "High";
  //         document.getElementById("instruct").style.display = "none";
  //         document.getElementById("infoCard").style.display = "block";
  //         document.getElementById("projName").textContent = infoMarker.projectName;  
  //         document.getElementById("projNum").textContent = "Project Number: " + infoMarker.projectID;  
  //         document.getElementById("projDesc").textContent = infoMarker.projectDesc;  
  //         document.getElementById("trafficLevel").textContent = "Traffic Level: " + level;
  //         document.getElementById("averageFlow").textContent = "Average Flow: " + averageLevel + " cars"
  //       });

  //     }
  //   }
  //   else if(tabChangeEvent.tab.textLabel === "Filter Data") {
  //     this.clearFiltersAndUpdateMap();
  //   }
  // }

  public markerClick() {
    var selectedMarker;
    for(let marker of this.leafletMarkers) {
      if(marker.isPopupOpen) {
        selectedMarker = marker;
        break;
      }
    }

    for(let marker of this.allPlanMarkers) {
      alert(marker.coordinates)
    }
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
    this.clearFiltersAndUpdateMap();
    // const DATA_URL = '/api'
    // var command = "select * from traffic"
    // this.http.post(DATA_URL, {command:command}).subscribe((data: any[]) => {
    //   this.allTrafficMarkers = getTrafficMarkersFromFeatures(data);
    //   this.clearFiltersAndUpdateMap();
    // })

    // const TRAFFIC_URL = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    // this.http.get(TRAFFIC_URL).subscribe((trafficJson: FeatureCollection) => {
    //   this.allTrafficMarkers = getTrafficMarkersFromFeatures(trafficJson.features);
    //   this.clearFiltersAndUpdateMap();
    // });

    // const TPS_URL = 'assets/Transportation_System_Plan_TSP_Project__Point.geojson';
    // this.http.get(TPS_URL).subscribe((planJson: FeatureCollection) => {
    //   this.allPlanMarkers = getPlanMarkersFromFeatures(planJson.features);
    // });

    //const ZILLOW_URL = '/webservice/GetSearchResults.htm?zws-id=X1-ZWz181mfqr44y3_2jayc&address=6902+N+Richmond+Ave&citystatezip=Portland%2C+OR'
    // this.http.get(ZILLOW_URL, {responseType: 'text'}).subscribe((zillowXML) => {
    //   console.log("test")
    //   console.log(zillowXML)
    // });
    
    // this.http.get(ZILLOW_URL, {responseType: 'text'}).subscribe(zillowXML => {
    //   var start = zillowXML.indexOf("<amount currency=") + 23
    //   var end = zillowXML.indexOf("</amount>")
    //   console.log(zillowXML.substring(start, end))
    // })

    // var command = "select * from tsp"
    // const DATA_URL = '/api'
    // this.http.post(DATA_URL, {command:command}).subscribe(tspProjects => {
    //   console.log(tspProjects)
    // })

    //.pipe(map(res => {console.log(res)}))

    // this.jsonp.get(ZILLOW_URL, {responseType: ResponseContentType.Text}).subscribe( zillowXML => {
    //   console.log("test")
    //   console.log(zillowXML)
    // })
    
  }

  public updateOptions(e: KeyboardEvent) {
    if(e.keyCode)
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

}
