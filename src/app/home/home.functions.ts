import {Feature} from 'geojson';
import {Icon, LatLngExpression, Marker, marker} from 'leaflet';
import {DensityInfo, TrafficMarker} from './home.interfaces';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.constants';
import {TrafficDensity, VehicleFilter, VehicleType} from './home.enums';
import {MatSelect} from "@angular/material";

export function getCoordinateFromFeature(feature: Feature): LatLngExpression {
  if (!feature) {
    return null;
  }

  // The coordinates are reversed in the JSON.
  return (feature.geometry as any).coordinates.reverse() as LatLngExpression;
}

export function isBikeFeature(feature: Feature): boolean {
  return feature.properties.ExceptType === 'Bike Count' || feature.properties.Comment === 'ONLY BIKES';
}

export function getVehicleFilterFromVehicleSelector(vehicleSelector: MatSelect): VehicleFilter {
  if (vehicleSelector.empty) {
    return VehicleFilter.ALL;
  }

  if (vehicleSelector.value === VehicleType.Bike) {
    return VehicleFilter.BIKE;
  }

  return VehicleFilter.CAR;
}

export function markerValidForVehicleFilter(trafficMarker: TrafficMarker, vehicleFilter: VehicleFilter): boolean {
  if (vehicleFilter === VehicleFilter.ALL) {
    return true;
  }

  if (trafficMarker.isBikeMarker && vehicleFilter === VehicleFilter.BIKE) {
    return true;
  }

  return !trafficMarker.isBikeMarker && vehicleFilter === VehicleFilter.CAR;
}

export function getDensityIconFromMarker(marker: TrafficMarker): Icon {
  const trafficVolume = marker.trafficDensity;

  if (inDensityRange(trafficVolume, DENSITIES[TrafficDensity.High])) {
    return RED_ICON;
  }

  if (inDensityRange(trafficVolume, DENSITIES[TrafficDensity.Medium])) {
    return ORANGE_ICON;
  }

  return GREEN_ICON;
}

export function getFeatureStartDate(feature: Feature): string {
  return feature.properties.StartDate;
}

export function getMarkersFromFeatures(features: Feature[]): TrafficMarker[] {
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
  return inputTrafficDensity >= targetDensityRange.min && inputTrafficDensity <= targetDensityRange.max;
}

export function getLeafletMarkerFromTrafficMarker(trafficMarker: TrafficMarker): Marker {
  const vehicle = trafficMarker.isBikeMarker ? VehicleType.Bike : VehicleType.Car;
  const icon = getDensityIconFromMarker(trafficMarker);

  return marker(trafficMarker.coordinates, {riseOnHover: true, icon})
    .bindPopup(`Daily Volume: ${trafficMarker.trafficDensity} ${vehicle}`);
}
