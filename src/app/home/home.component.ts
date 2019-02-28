import {Component, ViewChild} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {MatSelect} from "@angular/material";
import {latLng, tileLayer, Map as LeafletMap, LatLngExpression, marker, layerGroup, LayerGroup, icon, point, Icon} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {Feature, FeatureCollection} from "geojson";

interface Location {
  readonly name: string;
  readonly coordinate: number[];
}

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('areaSelector')
  private areaSelector: MatSelect;

  @ViewChild('yearSelector')
  private yearSelector: MatSelect;

  @ViewChild('vehicleSelector')
  private vehicleSelector: MatSelect;

  @ViewChild('densitySelector')
  private densitySelector: MatSelect;


  years: String[] = ["2019", "2018", "2017", "2016", "2015", "2014"];
  areas: Location[] = [
    {name: "North", coordinate: [45.6075, -122.7236]},
    {name: "South", coordinate: [45.4886, -122.6755]},
    {name: "Northwest", coordinate: [45.5586, -122.7609]},
    {name: "Northeast", coordinate: [45.5676, -122.6179]},
    {name: "Southwest", coordinate: [45.4849, -122.7116]},
    {name: "Southeast", coordinate: [45.4914, -122.5930]}
  ];
  vehicles: String[] = ["Car", "Bike"];
  densities: String[] = ["High", "Medium", "Low"];

  private trafficFeatures: Array<Feature>;
  private bikeTraffic: LayerGroup = layerGroup();
  private carTraffic: LayerGroup = layerGroup();
  private allData: LayerGroup = layerGroup();
  private map: LeafletMap;

  private greenIcon = icon({
    iconUrl: '../../assets/images/greenMarker.png',
    iconSize: [10, 10], // size of the icon
  });

  private redIcon = icon({
    iconUrl: '../../assets/images/redMarker.png',
    iconSize: [10, 10], // size of the icon
  });

  private orangeIcon = icon({
    iconUrl: '../../assets/images/orangeMarker.png',
    iconSize: [10, 10], // size of the icon
  });

  leafletOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 11,
    center: latLng([45.5122, -122.6587])
  };

  public constructor(private titleService: Title, private http: HttpClient) {
    titleService.setTitle("Portland Traffic Reform");
  }

  // This method is necessary. Why? I don't know. If you can fix it, please do. 
  // Map only updates if filterData() runs twice, so this is a bad work around. 
  callFilter(): void {
    this.filterData();
    this.filterData();
  }

  filterData(): void {
    let selectedLocation: Location = this.areaSelector.empty ? {name: "All", coordinate: [45.5122, -122.6587]} : this.areaSelector.value;
    let selectedYear: String = this.yearSelector.value;
    let selectedVehicle: String = this.vehicleSelector.value;
    let selectedDensity: String = this.densitySelector.value;

    let zoom: number = this.areaSelector.empty ? 11 : 12.5;
    
    let maxFlow: number = 100000;
    let minFlow: number = 0;
    let bikesOnly: boolean = selectedVehicle === "Car" ? false : true;
    let carsOnly: boolean = selectedVehicle === "Bike" ? false : true;
    let year: String = this.yearSelector.empty ? "-" : selectedYear;

    if(this.densitySelector.empty) {
      maxFlow = 100000;
      minFlow = 0;
    }
    else if(selectedDensity === "High") {
      maxFlow = 100000;
      minFlow = 4000;
    }
    else if(selectedDensity === "Medium") {
      maxFlow = 4000;
      minFlow = 500;
    }
    else {
      maxFlow = 500;
      minFlow = 0;
    }


    this.allData.clearLayers();
    this.map.removeLayer(this.allData);
    for(let point of this.trafficFeatures) {
      let coordinates: number[] = (point.geometry as any).coordinates;
      if(bikesOnly) {
        if((point.properties.ExceptType === "Bike Count" || point.properties.Comment === "ONLY BIKES") && point.properties.ADTVolume <= maxFlow && point.properties.ADTVolume > minFlow && point.properties.StartDate.indexOf(year) !== -1) {
          if(point.properties.ADTVolume > 4000) {
            this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.redIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" Bikes"));
          }
          else if(point.properties.ADTVolume > 500) {
            this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.orangeIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" Bikes"));
          }
          else {
            this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.greenIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" Bikes"));
          }
        }
      }
      if(carsOnly) {
        if((point.properties.ExceptType !== "Bike Count" && point.properties.Comment !== "ONLY BIKES") && point.properties.ADTVolume <= maxFlow && point.properties.ADTVolume > minFlow && point.properties.StartDate.indexOf(year) !== -1) {
          if(point.properties.ADTVolume > 4000) {
            this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.redIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" Cars"));
          }
          else if(point.properties.ADTVolume > 500) {
            this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.orangeIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" Cars"));
          }
          else {
            this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.greenIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" Cars"));
          }
        }
      }
    }
    this.allData.addTo(this.map);
    this.map.flyTo(selectedLocation.coordinate as LatLngExpression, zoom);
  }

  clearFilters() : void {
    this.areaSelector.value = '';
    this.yearSelector.value = '';
    this.vehicleSelector.value = '';
    this.densitySelector.value = '';

    this.callFilter();
  }

  // initialize Leaflet map.
  onMapReady(map: LeafletMap): void {
    this.map = map;

    const trafficUrl = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    this.http.get(trafficUrl).subscribe((trafficJson: FeatureCollection) => {
      this.trafficFeatures = trafficJson.features;

      // Example of filtering data. For now just filter data to be bike data. This will change later.
      for (let point of this.trafficFeatures) {
        // The coordinates are reversed in the JSON.
        let coordinates: number[] = (point.geometry as any).coordinates;
        let vehicleType: String = "Cars";
        if(point.properties.ExceptType === "Bike Count" || point.properties.Comment === "ONLY BIKES") vehicleType = "Bikes";
        if(point.properties.ADTVolume > 5000) {
          this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.redIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" "+vehicleType));
        }
        else if(point.properties.ADTVolume > 1000) {
          this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.orangeIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" "+vehicleType));
        }
        else {
          this.allData.addLayer(marker(coordinates.reverse() as LatLngExpression, {riseOnHover: true, icon: this.greenIcon}).bindPopup("Daily Volume: "+point.properties.ADTVolume+" "+vehicleType));
        }
        
      }
      this.allData.addTo(this.map);
    });
  }

  clearFilters() : void {
    this.areaSelector.value = '';
    this.yearSelector.value = '';
    this.vehicleSelector.value = '';
    this.densitySelector.value = '';
  }
}
