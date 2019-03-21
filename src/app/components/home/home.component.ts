import {Component, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect, MatTabChangeEvent, MatTableDataSource} from '@angular/material';
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
import {DENSITIES, RED_ICON, GREEN_ICON, ORANGE_ICON} from './home.component.constants';

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

  private DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];
  private DEFAULT_INTENSITY_RANGE: DensityInfo = {min: 0, max: 100000};

  private allTrafficMarkers: TrafficMarker[];
  private allPlanMarkers: PlanMarker[];
  private leafletMarkers: Marker[] = [];
  private map: LeafletMap;

  // Fields accessed by the HTML (template).
  public objectKeys = Object.keys;
  public densities = DENSITIES;
  public years: string[] = ['2019', '2018', '2017', '2016', '2015', '2014'];
  public vehicles: string[] = Object.values(VehicleType);
  public areas: {[location: string]: LatLngExpression} = {
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
    titleService.setTitle('Portland Traffic Reform');
  }

  private getRelevantMarkers(): TrafficMarker[] {
    const selectedDensity = this.densitySelector.empty ? this.DEFAULT_INTENSITY_RANGE : this.densitySelector.value;
    const selectedYear = this.yearSelector.empty ? '-' : this.yearSelector.value;
    const selectedVehicleFilter = getVehicleFilterFromVehicleSelectorValue(this.vehicleSelector.value);

    return this.allTrafficMarkers.filter(trafficMarker =>
      inDensityRange(trafficMarker.trafficDensity, selectedDensity) &&
      trafficMarker.startDate.includes(selectedYear) &&
      markerValidForVehicleFilter(trafficMarker, selectedVehicleFilter)
    );
  }

  private updateLeafletMapLocation(): void {
    const coordinates = this.areaSelector.empty ? this.DEFAULT_COORDS : this.areaSelector.value;
    const zoom = this.areaSelector.empty ? 11 : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  private updateDisplayedLeafletMarkers(): void {
    this.leafletMarkers.forEach(marker => this.map.removeLayer(marker));
    
    const relevantTrafficMarkers = this.getRelevantMarkers();
    this.leafletMarkers = relevantTrafficMarkers.map(trafficMarker => {
        const leafletMarker = getLeafletMarkerFromTrafficMarker(trafficMarker);
        this.map.addLayer(leafletMarker);
        return leafletMarker;
      }
    );
  }

  public updateMap(): void {
    this.updateDisplayedLeafletMarkers();
    this.updateLeafletMapLocation();
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    if(tabChangeEvent.tab.textLabel === "View Projects") {
      this.leafletMarkers.forEach(marker => this.map.removeLayer(marker));
      for(let marker of this.allPlanMarkers) {
        const leafletMarker = getLeafletMarkerFromPlanMarker(marker);
        this.leafletMarkers.push(leafletMarker)
        this.map.addLayer(leafletMarker)
      }

      let allMarkers = this.leafletMarkers;
      let planMarkers = this.allPlanMarkers;
      let tempMap = this.map;
      let trafficMarkers = this.allTrafficMarkers;
      for(let lmarker of this.leafletMarkers) {
        lmarker.on("click", function(e) {
          var selectedMarker;
          for(let marker of allMarkers) {
            if(marker.isPopupOpen()) {
              selectedMarker = marker;
              break;
            }
          }
          
          var infoMarker: PlanMarker;
          for(let pmarker of planMarkers) {
            var markerCoords = pmarker.coordinates.toString().split(",")
            if(markerCoords[0] == String(selectedMarker.getLatLng().lat) && markerCoords[1] == String(selectedMarker.getLatLng().lng)) {
              infoMarker = pmarker;
              break;
            }
          }

          var strBounds: String[] = infoMarker.coordinates.toString().split(",")
          var corner1 = latLng(+strBounds[0]-0.02, +strBounds[1]-0.02)
          var corner2 = latLng(+strBounds[0]+0.02, +strBounds[1]+0.02)
          var setBounds = latLngBounds(corner1, corner2)
          tempMap.flyToBounds(setBounds, {maxZoom: 15});
          var sum: number = 0;
          var amount: number = 0.0000000001;
          for(let tmarker of trafficMarkers) {
            if(setBounds.contains(tmarker.coordinates)) {
              if(tmarker.trafficDensity <= 1000) {
                tempMap.addLayer(marker(tmarker.coordinates, {riseOnHover: true, icon: GREEN_ICON}).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`))
              }
              else if(tmarker.trafficDensity <= 5000) {
                tempMap.addLayer(marker(tmarker.coordinates, {riseOnHover: true, icon: ORANGE_ICON}).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`))
              }
              else if(tmarker.trafficDensity > 5000) {
                tempMap.addLayer(marker(tmarker.coordinates, {riseOnHover: true, icon: RED_ICON}).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`))
              }
              sum = sum + tmarker.trafficDensity;
              amount = amount + 1;
            }
          }
          var averageLevel = Math.round(sum/amount);
          var level: String = averageLevel < 1000 ? "Low" : averageLevel < 5000 ? "Medium" : "High";
          document.getElementById("instruct").style.display = "none";
          document.getElementById("infoCard").style.display = "block";
          document.getElementById("projName").textContent = infoMarker.projectName;  
          document.getElementById("projNum").textContent = "Project Number: " + infoMarker.projectID;  
          document.getElementById("projDesc").textContent = infoMarker.projectDesc;  
          document.getElementById("trafficLevel").textContent = "Traffic Level: " + level;
          document.getElementById("averageFlow").textContent = "Average Flow: " + averageLevel + " cars"
        });

      }
    }
    else if(tabChangeEvent.tab.textLabel === "Filter Data") {
      this.clearFiltersAndUpdateMap();
    }
  }

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
    this.vehicleSelector.value = 'Cars';
    this.densitySelector.value = '';

    this.updateMap();
  }

  /**
   * Initialize Leaflet map.
   * @param map The Leaflet map to initialize.
   */
  public onMapReady(map: LeafletMap): void {
    this.map = map;

    const TRAFFIC_URL = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    this.http.get(TRAFFIC_URL).subscribe((trafficJson: FeatureCollection) => {
      this.allTrafficMarkers = getTrafficMarkersFromFeatures(trafficJson.features);
      this.clearFiltersAndUpdateMap();
    });

    const TPS_URL = 'assets/Transportation_System_Plan_TSP_Project__Point.geojson';
    this.http.get(TPS_URL).subscribe((planJson: FeatureCollection) => {
      this.allPlanMarkers = getPlanMarkersFromFeatures(planJson.features);
    });
  }
}
