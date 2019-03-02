import {Feature} from 'geojson';
import {Icon, LatLngExpression} from 'leaflet';
import {TrafficMarker, DensityInfo} from './home.interfaces';
import {GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.constants';
import {TrafficDensity} from './home.enums';
import {DENSITIES} from './home.constants';

export function getCoordinateFromFeature(feature: Feature): LatLngExpression {
  // The coordinates are reversed in the JSON.
  return (feature.geometry as any).coordinates.reverse() as LatLngExpression;
}

export function isBikeFeature(feature: Feature): boolean {
  return feature.properties.ExceptType === 'Bike Count' || feature.properties.Comment === 'ONLY BIKES';
}

export function getDensityIconFromMarker(marker: TrafficMarker): Icon {
  const trafficVolume: number = marker.trafficDensity;

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
