import {Component, ViewChild, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {MatSelect, MatTabChangeEvent, MatSnackBar} from '@angular/material';
import {LatLng, latLng, latLngBounds, LatLngExpression, Map as LeafletMap, MapOptions, marker, Marker, tileLayer} from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {FeatureCollection} from 'geojson';
import {
  getMarkerDictKey,
  getLeafletMarkerDict,
  getLeafletMarkerFromPlanMarker,
  getPlanMarkersFromFeatures, getTrafficMarkersFromFeatures
} from './home.component.functions';
import {AREAS, DEFAULT_COORDS, DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON, VEHICLES, YEARS} from './home.component.constants';
import {PlanMarker, TrafficMarker} from './home.component.interfaces';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('areaSelector') private areaSelector: MatSelect;
  @ViewChild('yearSelector') private yearSelector: MatSelect;
  @ViewChild('vehicleSelector') private vehicleSelector: MatSelect;
  @ViewChild('densitySelector') private densitySelector: MatSelect;

  private DEFAULT_ZOOM = 11;

  private leafletMarkerDict: { [markerKey: string]: Marker[] } = {};
  private currentLeafletMarkers: Marker[] = [];

  private allTrafficMarkers: TrafficMarker[];

  private allPlanMarkers: PlanMarker[];
  private leafletMarkers: Marker[] = [];
  private map: LeafletMap;


  // Fields used by auto-complete address.
  myControl = new FormControl();
  options: string[] = ['baked', 'break', 'baker', 'bread', 'broke', 'block', 'bleak', 'beast', 'beam', 'broom'];
  filteredOptions: Observable<string[]>;
  value = '';

  // Fields accessed by the HTML (template).
  public objectKeys = Object.keys;
  public densities = DENSITIES;
  public years = YEARS;
  public vehicleTypes = VEHICLES;
  public areas = AREAS;

  // Used by the HTML/template to set Leaflet's options.
  public leafletOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: this.DEFAULT_ZOOM,
    center: latLng(DEFAULT_COORDS)
  };

  // Autocomplete via a filter.
  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }


  public constructor(private titleService: Title, private http: HttpClient, private snackBar: MatSnackBar) {
    titleService.setTitle('Portland Traffic Reform');
  }

  private updateLeafletMapLocation(): void {
    const coordinates = this.areas[this.areaSelector.value];
    const zoom = this.areaSelector.value === Object.keys(this.areas)[0] ? this.DEFAULT_ZOOM : 12.5;
    this.map.flyTo(coordinates, zoom);
  }

  private updateDisplayedLeafletMarkers(): void {
    this.currentLeafletMarkers.forEach(leafletMarker => this.map.removeLayer(leafletMarker));

    const selectedArea: string = this.areaSelector.value;
    const selectedVehicle: string = this.vehicleSelector.value;
    const selectedYear: string = this.yearSelector.value;
    const selectedDensity: string = this.densitySelector.value;

    const markerDictKey = getMarkerDictKey(selectedArea, selectedVehicle, selectedYear, selectedDensity);
    const relevantTrafficMarkers = this.leafletMarkerDict[markerDictKey];

    this.currentLeafletMarkers = relevantTrafficMarkers.map(leafletMarker => {
      this.map.addLayer(leafletMarker);
      return leafletMarker;
    });
  }

  public updateMap(): void {
    this.updateDisplayedLeafletMarkers();
    this.updateLeafletMapLocation();
  }

  public setFilterDefaultsAndUpdateMap(): void {
    this.areaSelector.value = Object.keys(this.areas)[0];
    this.yearSelector.value = this.years[0];
    this.vehicleSelector.value = this.vehicleTypes[0];
    this.densitySelector.value = Object.keys(this.densities)[0];

    this.updateMap();
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    if (tabChangeEvent.tab.textLabel === 'View Projects') {
      this.leafletMarkers.forEach(marker => this.map.removeLayer(marker));
      for (let marker of this.allPlanMarkers) {
        const leafletMarker = getLeafletMarkerFromPlanMarker(marker);
        this.leafletMarkers.push(leafletMarker);
        this.map.addLayer(leafletMarker);
      }

      let allMarkers = this.leafletMarkers;
      let planMarkers = this.allPlanMarkers;
      let tempMap = this.map;
      let trafficMarkers = this.allTrafficMarkers;
      for (let lmarker of this.leafletMarkers) {
        lmarker.on('click', function(e) {
          var selectedMarker;
          for (let marker of allMarkers) {
            if (marker.isPopupOpen()) {
              selectedMarker = marker;
              break;
            }
          }

          var infoMarker: PlanMarker;
          for (let pmarker of planMarkers) {
            var markerCoords = pmarker.coordinates.toString().split(',');
            if (markerCoords[0] == String(selectedMarker.getLatLng().lat) && markerCoords[1] == String(selectedMarker.getLatLng().lng)) {
              infoMarker = pmarker;
              break;
            }
          }

          var strBounds: String[] = infoMarker.coordinates.toString().split(',');
          var corner1 = latLng(+strBounds[0] - 0.02, +strBounds[1] - 0.02);
          var corner2 = latLng(+strBounds[0] + 0.02, +strBounds[1] + 0.02);
          var setBounds = latLngBounds(corner1, corner2);
          tempMap.flyToBounds(setBounds, {maxZoom: 15});
          var sum: number = 0;
          var amount: number = 0.0000000001;
          for (let tmarker of trafficMarkers) {
            if (setBounds.contains(tmarker.coordinates)) {
              if (tmarker.trafficDensity <= 1000) {
                tempMap.addLayer(marker(tmarker.coordinates, {
                  riseOnHover: true,
                  icon: GREEN_ICON
                }).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`));
              } else if (tmarker.trafficDensity <= 5000) {
                tempMap.addLayer(marker(tmarker.coordinates, {
                  riseOnHover: true,
                  icon: ORANGE_ICON
                }).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`));
              } else if (tmarker.trafficDensity > 5000) {
                tempMap.addLayer(marker(tmarker.coordinates, {
                  riseOnHover: true,
                  icon: RED_ICON
                }).bindPopup(`Daily Volume: ${tmarker.trafficDensity} cars`));
              }
              sum = sum + tmarker.trafficDensity;
              amount = amount + 1;
            }
          }
          var averageLevel = Math.round(sum / amount);
          var level: String = averageLevel < 1000 ? 'Low' : averageLevel < 5000 ? 'Medium' : 'High';
          document.getElementById('instruct').style.display = 'none';
          document.getElementById('infoCard').style.display = 'block';
          document.getElementById('projName').textContent = infoMarker.projectName;
          document.getElementById('projNum').textContent = 'Project Number: ' + infoMarker.projectID;
          document.getElementById('projDesc').textContent = infoMarker.projectDesc;
          document.getElementById('trafficLevel').textContent = 'Traffic Level: ' + level;
          document.getElementById('averageFlow').textContent = 'Average Flow: ' + averageLevel + ' cars';
        });

      }
    } else if (tabChangeEvent.tab.textLabel === 'Filter Data') {
      this.clearFiltersAndUpdateMap();
    }
  }

  public markerClick() {
    var selectedMarker;
    for (let marker of this.leafletMarkers) {
      if (marker.isPopupOpen) {
        selectedMarker = marker;
        break;
      }
    }

    for (let marker of this.allPlanMarkers) {
      alert(marker.coordinates);
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
      this.leafletMarkerDict = getLeafletMarkerDict(trafficJson.features);
      this.setFilterDefaultsAndUpdateMap();
    });

    const TPS_URL = 'assets/Transportation_System_Plan_TSP_Project__Point.geojson';
    this.http.get(TPS_URL).subscribe((planJson: FeatureCollection) => {
      this.allPlanMarkers = getPlanMarkersFromFeatures(planJson.features);
    });
  }

  public searchAddress(address: string): void {
    if (address === '') {
      this.snackBar.open('Address Not Found', 'x', {
        duration: 2000,
      }); // opens snackbar for 2 seconds telling the user that they have inputted an invalid address
    } else {
      const location: LatLngExpression = [45.5586, -122.7609];
      this.map.flyTo(location, 17);
      const addressInfo = 'Address: ' + address + '\n' + 'Geographic Coordinates: ' + location;
      this.snackBar.open(addressInfo, 'x', {});
    } // moves map to address and opens snackbar to display address info till user clicks the x
  }
}
