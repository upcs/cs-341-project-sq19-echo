import {Feature} from 'geojson';
import {Icon, LatLngExpression, Marker, marker} from 'leaflet';
import {DensityInfo, TrafficMarker} from './home.interfaces';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.constants';
import {TrafficDensity, VehicleFilter, VehicleType} from './home.enums';
import {MatSelect} from '@angular/material';
import {isNullOrUndefined} from 'util';

export function getCoordinateFromFeature(feature: Feature): LatLngExpression {
  if (isNullOrUndefined(feature)) {
    return null;
  }

  // The coordinates are reversed in the JSON.
  return (feature.geometry as any).coordinates.reverse() as LatLngExpression;
}

export function isBikeFeature(feature: Feature): boolean {
  if (isNullOrUndefined(feature)) {
    return null;
  }

  return feature.properties.ExceptType === 'Bike Count' || feature.properties.Comment === 'ONLY BIKES';
}

export function getVehicleFilterFromVehicleSelector(vehicleSelector: MatSelect): VehicleFilter {
  if (isNullOrUndefined(vehicleSelector)) {
    return null;
  }

  if (vehicleSelector.empty) {
    return VehicleFilter.ALL;
  }

  if (vehicleSelector.value === VehicleType.Bike) {
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

  return feature.properties.StartDate;
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
