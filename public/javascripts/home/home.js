/*
import {latLng, latLngBounds, marker, tileLayer} from 'leaflet';
import {
    getMarkerDictKey,
    getLeafletMarkerDict,
    getLeafletMarkerFromPlanMarker,
    getPlanMarkersFromFeatures, getTrafficMarkersFromFeatures
} from './home.functions';
import {
    AREAS,
    DEFAULT_COORDS,
    DEFAULT_ZOOM,
    DENSITIES,
    GREEN_ICON,
    ORANGE_ICON,
    RED_ICON,
    VEHICLES,
    YEARS
} from './home.constants';
import * as L from "leaflet";*/

var areaSelector, yearSelector, vehicleSelector, densitySelector, map;
$(document).ready(function () {
    $('#navBar').html(getNavBarHtml('home'));


});
    /*

    map = L.map('map');
    map.options = {
        layers: [
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            })
        ],
        zoom: DEFAULT_ZOOM,
        center: latLng(DEFAULT_COORDS)
    };

    const TRAFFIC_URL = 'https://opendata.arcgis.com/datasets/6ba5258ffea34e878168ddc8cf34f7e3_250.geojson';
    $.get(TRAFFIC_URL, function (trafficJson) {
        allTrafficMarkers = getTrafficMarkersFromFeatures(trafficJson.features);
        leafletMarkerDict = getLeafletMarkerDict(trafficJson.features);
        setFilterDefaultsAndUpdateMap();
    });

    const TPS_URL = 'assets/Transportation_System_Plan_TSP_Project__Point.geojson';
    $.get(TPS_URL, function (planJson) {
        allPlanMarkers = getPlanMarkersFromFeatures(planJson.features);
    });

    areaSelector = $("#areaSelector");
    yearSelector = $("#yearSelector");
    vehicleSelector = $("#vehicleSelector");
    densitySelector = $("#densitySelector");
});

let leafletMarkerDict = {};

let currentLeafletMarkers = [];
let allTrafficMarkers = [];
let allPlanMarkers = [];
let leafletMarkers = [];

function updateLeafletMapLocation() {
    const coordinates = AREAS[areaSelector.value];
    const zoom = areaSelector.value === Object.keys(AREAS)[0] ? DEFAULT_ZOOM : 12.5;
    map.flyTo(coordinates, zoom);
}

function updateDisplayedLeafletMarkers() {
    currentLeafletMarkers.forEach(leafletMarker => map.removeLayer(leafletMarker));

    const selectedArea = areaSelector.value;
    const selectedVehicle = vehicleSelector.value;
    const selectedYear = yearSelector.value;
    const selectedDensity = densitySelector.value;

    const markerDictKey = getMarkerDictKey(selectedArea, selectedVehicle, selectedYear, selectedDensity);
    const relevantTrafficMarkers = leafletMarkerDict[markerDictKey];

    currentLeafletMarkers = relevantTrafficMarkers.map(leafletMarker => {
        map.addLayer(leafletMarker);
        return leafletMarker;
    });
}

function updateMap() {
    updateDisplayedLeafletMarkers();
    updateLeafletMapLocation();
}

function setFilterDefaultsAndUpdateMap() {
    areaSelector.value = Object.keys(AREAS)[0];
    yearSelector.value = YEARS[0];
    vehicleSelector.value = VEHICLES[0];
    densitySelector.value = Object.keys(DENSITIES)[0];

    updateMap();
}

function tabChanged(tabChangeEvent) {
    if (tabChangeEvent.tab.textLabel === "View Projects") {
        leafletMarkers.forEach(marker => map.removeLayer(marker));
        for (let marker of allPlanMarkers) {
            const leafletMarker = getLeafletMarkerFromPlanMarker(marker);
            leafletMarkers.push(leafletMarker);
            map.addLayer(leafletMarker);
        }

        let allMarkers = leafletMarkers;
        let planMarkers = allPlanMarkers;
        let tempMap = map;
        let trafficMarkers = allTrafficMarkers;
        for (let lmarker of leafletMarkers) {
            lmarker.on("click", function (e) {
                let selectedMarker;
                for (let marker of allMarkers) {
                    if (marker.isPopupOpen()) {
                        selectedMarker = marker;
                        break;
                    }
                }

                let infoMarker;
                for (let pmarker of planMarkers) {
                    let markerCoords = pmarker.coordinates.toString().split(",");
                    if (markerCoords[0] === String(selectedMarker.getLatLng().lat) && markerCoords[1] === String(selectedMarker.getLatLng().lng)) {
                        infoMarker = pmarker;
                        break;
                    }
                }

                let strBounds = infoMarker.coordinates.toString().split(",");
                let corner1 = latLng(+strBounds[0] - 0.02, +strBounds[1] - 0.02);
                let corner2 = latLng(+strBounds[0] + 0.02, +strBounds[1] + 0.02);
                let setBounds = latLngBounds(corner1, corner2);
                tempMap.flyToBounds(setBounds, {maxZoom: 15});
                let sum = 0;
                let amount = 0.0000000001;
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

                let averageLevel = Math.round(sum / amount);
                let level = averageLevel < 1000 ? "Low" : averageLevel < 5000 ? "Medium" : "High";

                $("#instruct").style.display = "none";
                $("#infoCard").style.display = "block";
                $("#projName").textContent = infoMarker.projectName;
                $("#projNum").textContent = `Project Number: ${infoMarker.projectID}`;
                $("#projDesc").textContent = infoMarker.projectDesc;
                $("#trafficLevel").textContent = `Traffic Level: ${level}`;
                $("#averageFlow").textContent = `Average Flow: ${averageLevel} cars`;
            });

        }
    } else if (tabChangeEvent.tab.textLabel === "Filter Data") {
        clearFiltersAndUpdateMap();
    }
}

function markerClick() {
    let selectedMarker;
    for (let marker of leafletMarkers) {
        if (marker.isPopupOpen) {
            selectedMarker = marker;
            break;
        }
    }
}

function clearFiltersAndUpdateMap() {
    areaSelector.value = '';
    yearSelector.value = '';
    vehicleSelector.value = 'Cars';
    densitySelector.value = '';

    updateMap();
}*/
