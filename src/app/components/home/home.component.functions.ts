import {Feature} from 'geojson';
import {Icon, LatLngExpression, Marker, marker} from 'leaflet';
import {AREAS, DEFAULT_ICON, DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON, VEHICLES, YEARS} from './home.component.constants';
import {DensityInfo, TrafficMarker, PlanMarker} from './home.component.interfaces';

export function getCoordinateFromFeature(feature: Feature): LatLngExpression {
  if (feature == null) {
    return null;
  }

  const featureGeometry = feature.geometry as any;
  if (featureGeometry == null) {
    return null;
  }

  const featureCoordinates: number[] = featureGeometry.coordinates;
  if (featureCoordinates == null) {
    return null;
  }

  // The coordinates are reversed in the JSON.
  return featureCoordinates.reverse() as LatLngExpression;
}

export function getProjectCoords(feature: Feature): LatLngExpression {
  if (feature == null) {
    return null;
  }

  const featureGeometry = feature.geometry as any;
  if (featureGeometry == null) {
    return null;
  }

  const featureCoordinates: number[] = featureGeometry.coordinates[0];
  if (featureCoordinates == null) {
    return null;
  }

  // The coordinates are reversed in the JSON.
  return featureCoordinates.reverse() as LatLngExpression;
}

export function getProjectName(feature: Feature): string {
  return feature.properties.ProjectName;
}

export function getProjectID(feature: Feature): string {
  return feature.properties.ProjectNumber;
}

export function getProjectDescription(feature: Feature): string {
  return feature.properties.ProjectDescription;
}

export function isBikeFeature(feature: Feature): boolean {
  if (feature == null) {
    return null;
  }

  const featureProperties = feature.properties;
  if (featureProperties == null) {
    return null;
  }

  return featureProperties.ExceptType === 'Bike Count' || featureProperties.Comment === 'ONLY BIKES';
}

export function markerValidForVehicleFilter(leafletMarker: Marker, vehicleType: string): boolean {
  if (leafletMarker == null || vehicleType == null) {
    return null;
  }

  if (!['Both', 'Bike', 'Car'].includes(vehicleType)) {
    return null;
  }

  if (vehicleType === 'Both') {
    return true;
  }

  const popupContent = leafletMarker.getPopup().getContent().toString();
  if (popupContent.includes('Bikes') && vehicleType === 'Bike') {
    return true;
  }

  return popupContent.includes('Cars') && vehicleType === 'Car';
}

export function getDensityIconFromTrafficVolume(trafficVolume: number): Icon {
  if (trafficVolume == null) {
    return null;
  }

  if (inDensityRange(trafficVolume, DENSITIES['High'])) {
    return RED_ICON;
  }

  if (inDensityRange(trafficVolume, DENSITIES['Medium'])) {
    return ORANGE_ICON;
  }

  return GREEN_ICON;
}

export function getFeatureStartDate(feature: Feature): string {
  if (feature == null) {
    return null;
  }

  const featureProperties = feature.properties;
  if (featureProperties == null) {
    return null;
  }

  const startDate = featureProperties.StartDate;
  if (startDate == null) {
    return null;
  }

  return startDate;
}

export function getTrafficMarkersFromFeatures(features: Feature[]): TrafficMarker[] {
  if (features == null) {
    return [];
  }

  return features.map(feature => {
    return {
      coordinates: getCoordinateFromFeature(feature),
      trafficDensity: getFeatureAdtVolume(feature),
      startDate: getFeatureStartDate(feature),
      isBikeMarker: isBikeFeature(feature)
    };
  });
}

export function getPlanMarkersFromFeatures(features: Feature[]): PlanMarker[] {
  if (features == null) {
    return [];
  }

  return features.map(feature => {
    return {
      coordinates: getProjectCoords(feature),
      projectName: getProjectName(feature),
      projectID: getProjectID(feature),
      projectDesc: getProjectDescription(feature)
    };
  });
}

export function inDensityRange(inputTrafficDensity: number, targetDensityRange: DensityInfo): boolean {
  if (inputTrafficDensity == null || targetDensityRange == null) {
    return null;
  }

  return inputTrafficDensity >= targetDensityRange.min && inputTrafficDensity <= targetDensityRange.max;
}

export function getLeafletMarkerFromFeature(feature: Feature): Marker {
  if (feature == null) {
    return null;
  }

  const bikeFeature = isBikeFeature(feature);
  if (bikeFeature == null) {
    return null;
  }

  const vehicle = bikeFeature ? 'Bikes' : 'Cars';

  const trafficVolume = getFeatureAdtVolume(feature);
  if (trafficVolume == null) {
    return null;
  }
  
  // If trafficVolume is null, this icon will never be null.
  const icon = getDensityIconFromTrafficVolume(trafficVolume);

  const coordinates = getCoordinateFromFeature(feature);
  if (coordinates == null) {
    return null;
  }

  const startDate = getFeatureStartDate(feature);
  if (startDate == null) {
    return null;
  }

  return marker(coordinates, {riseOnHover: true, icon, title: `${startDate} --> ${trafficVolume}`})
    .bindPopup(`Daily Volume: ${trafficVolume} ${vehicle}`);
}

export function getLeafletMarkerFromPlanMarker(planMarker: PlanMarker): Marker {
  if (planMarker == null) {
    return null;
  }
  return marker(planMarker.coordinates, {riseOnHover: true, icon: DEFAULT_ICON})
    .bindPopup(`Project Number: ${planMarker.projectID}`);
}

export function getFeatureAdtVolume(feature: Feature): number {
  if (feature == null) {
    return null;
  }

  const featureProperties = feature.properties;
  if (featureProperties == null) {
    return null;
  }

  const adtVolume = featureProperties.ADTVolume;
  if (adtVolume == null) {
    return null;
  }

  return adtVolume;
}

export function getMarkerDictKey(area: string, vehicle: string, year: string, density: string): string {
  if (!Object.keys(AREAS).includes(area)) {
    return null;
  }

  if (!VEHICLES.includes(vehicle)) {
    return null;
  }

  if (!YEARS.includes(year)) {
    return null;
  }

  if (!Object.keys(DENSITIES).includes(density)) {
    return null;
  }

  return `${area}:${vehicle}:${year}:${density}`;
}

export function getTrafficDensityFromLeafletMarker(leafletMarker: Marker): number {
  if (leafletMarker == null) {
    return null;
  }

  const titleWords = leafletMarker.options.title.split(' ');
  return parseInt(titleWords[titleWords.length - 1], 10);
}

export function getLeafletMarkerDict(features: Feature[]): {[markerKey: string]: Marker[]} {
  if (features == null) {
    return null;
  }

  const allLeafletMarkers = features.map(feature => getLeafletMarkerFromFeature(feature));

  const leafletMarkerDict: {[markerKey: string]: Marker[]} = {};
  Object.keys(DENSITIES).forEach(density =>
    Object.keys(AREAS).forEach(area =>
      YEARS.forEach(year =>
        VEHICLES.forEach(vehicle => {
          const markerKey = getMarkerDictKey(area, vehicle, year, density);
          leafletMarkerDict[markerKey] = allLeafletMarkers.filter(marker =>
            inDensityRange(getTrafficDensityFromLeafletMarker(marker), DENSITIES[density]) &&
            (marker.options.title.includes(year) || year === YEARS[0]) &&
            markerValidForVehicleFilter(marker, vehicle)
          );
        })
      )
    )
  );
  return leafletMarkerDict;
}
