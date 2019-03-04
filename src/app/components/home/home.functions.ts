import {Feature} from 'geojson';
import {Icon, LatLngExpression, Marker, marker} from 'leaflet';
import {DensityInfo, TrafficMarker} from './home.interfaces';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.constants';
import {TrafficDensity, VehicleFilter, VehicleType} from './home.enums';
import {isNullOrUndefined} from 'util';

export function getCoordinateFromFeature(feature: Feature): LatLngExpression {
  if (isNullOrUndefined(feature)) {
    return null;
  }

  const featureGeometry = feature.geometry as any;
  if (isNullOrUndefined(featureGeometry)) {
    return null;
  }

  const featureCoordinates: number[] = featureGeometry.coordinates;
  if (isNullOrUndefined(featureCoordinates)) {
    return null;
  }

  // The coordinates are reversed in the JSON.
  return featureCoordinates.reverse() as LatLngExpression;
}

export function isBikeFeature(feature: Feature): boolean {
  if (isNullOrUndefined(feature)) {
    return null;
  }

  const featureProperties = feature.properties;
  if (isNullOrUndefined(featureProperties)) {
    return null;
  }

  return featureProperties.ExceptType === 'Bike Count' || featureProperties.Comment === 'ONLY BIKES';
}

export function getVehicleFilterFromVehicleSelectorValue(vehicleSelectorValue: string): VehicleFilter {
  if (isNullOrUndefined(vehicleSelectorValue)) {
    return null;
  }

  if (vehicleSelectorValue === '') {
    return VehicleFilter.ALL;
  }

  if (vehicleSelectorValue === VehicleType.Bike) {
    return VehicleFilter.BIKE;
  }

  return VehicleFilter.CAR;
}

export function markerValidForVehicleFilter(trafficMarker: TrafficMarker, vehicleFilter: VehicleFilter): boolean {
  if (isNullOrUndefined(trafficMarker) || isNullOrUndefined(vehicleFilter)) {
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
  if (isNullOrUndefined(trafficMarker)) {
    return null;
  }

  const trafficVolume = trafficMarker.trafficDensity;

  if (inDensityRange(trafficVolume, DENSITIES[TrafficDensity.High])) {
    return RED_ICON;
  }

  if (inDensityRange(trafficVolume, DENSITIES[TrafficDensity.Medium])) {
    return ORANGE_ICON;
  }

  return GREEN_ICON;
}

export function getFeatureStartDate(feature: Feature): string {
  if (isNullOrUndefined(feature)) {
    return null;
  }

  const featureProperties = feature.properties;
  if (isNullOrUndefined(featureProperties)) {
    return null;
  }

  const startDate = featureProperties.StartDate;
  if (isNullOrUndefined(startDate)) {
    return null;
  }

  return startDate;
}

export function getMarkersFromFeatures(features: Feature[]): TrafficMarker[] {
  if (isNullOrUndefined(features)) {
    return null;
  }

  return features.map(feature => {
    return {
      coordinates: getCoordinateFromFeature(feature),
      trafficDensity: feature.properties.ADTVolume,
      startDate: getFeatureStartDate(feature),
      isBikeMarker: isBikeFeature(feature)
    };
  });
}

export function inDensityRange(inputTrafficDensity: number, targetDensityRange: DensityInfo): boolean {
  if (isNullOrUndefined(inputTrafficDensity) || isNullOrUndefined(targetDensityRange)) {
    return null;
  }

  return inputTrafficDensity >= targetDensityRange.min && inputTrafficDensity <= targetDensityRange.max;
}

export function getLeafletMarkerFromTrafficMarker(trafficMarker: TrafficMarker): Marker {
  if (isNullOrUndefined(trafficMarker)) {
    return null;
  }

  const vehicle = trafficMarker.isBikeMarker ? VehicleType.Bike : VehicleType.Car;
  const icon = getDensityIconFromMarker(trafficMarker);

  return marker(trafficMarker.coordinates, {riseOnHover: true, icon})
    .bindPopup(`Daily Volume: ${trafficMarker.trafficDensity} ${vehicle}`);
}
