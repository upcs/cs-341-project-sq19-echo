import {Feature} from 'geojson';
import {Icon, LatLngExpression, Marker, marker} from 'leaflet';
import {DensityInfo, TrafficMarker, PlanMarker} from './home.component.interfaces';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON, DEFAULT_ICON} from './home.component.constants';
import {TrafficDensity, VehicleFilter, VehicleType} from './home.component.enums';

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

export function getVehicleFilterFromVehicleSelectorValue(vehicleSelectorValue: string): VehicleFilter {
  if (vehicleSelectorValue == null) {
    return null;
  }

  if (vehicleSelectorValue === '') {
    return VehicleFilter.ALL;
  }

  if (vehicleSelectorValue === VehicleType.Bike) {
    return VehicleFilter.BIKE;
  }

  if (vehicleSelectorValue === VehicleType.Car) {
    return VehicleFilter.CAR;
  }

  return null;
}

export function markerValidForVehicleFilter(trafficMarker: TrafficMarker, vehicleFilter: VehicleFilter): boolean {
  if (trafficMarker == null || vehicleFilter == null) {
    return null;
  }

  if (vehicleFilter === VehicleFilter.ALL) {
    return true;
  }

  if (trafficMarker.isBikeMarker && vehicleFilter === VehicleFilter.BIKE) {
    return true;
  }

  return !trafficMarker.isBikeMarker && vehicleFilter === VehicleFilter.CAR;
}

export function getDensityIconFromMarker(trafficMarker: TrafficMarker): Icon {
  if (trafficMarker == null) {
    return null;
  }

  const trafficVolume = trafficMarker.trafficDensity;

  if (trafficVolume == null) {
    return null;
  }

  if (inDensityRange(trafficVolume, DENSITIES[TrafficDensity.High])) {
    return RED_ICON;
  }

  if (inDensityRange(trafficVolume, DENSITIES[TrafficDensity.Medium])) {
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

export function getLeafletMarkerFromTrafficMarker(trafficMarker: TrafficMarker): Marker {
  if (trafficMarker == null) {
    return null;
  }

  const vehicle = trafficMarker.isBikeMarker ? VehicleType.Bike : VehicleType.Car;
  const icon = getDensityIconFromMarker(trafficMarker);

  if (icon == null) {
    return null;
  }
  
  return marker(trafficMarker.coordinates, {riseOnHover: true, icon})
    .bindPopup(`Daily Volume: ${trafficMarker.trafficDensity} ${vehicle}`);
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
