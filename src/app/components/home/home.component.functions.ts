import {Feature} from 'geojson';
import {Icon, LatLngExpression, Marker, marker} from 'leaflet';
import {DensityInfo, TrafficMarker} from './home.component.interfaces';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.component.constants';

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

export function markerValidForVehicleFilter(trafficMarker: TrafficMarker, vehicleType: string): boolean {
  if (trafficMarker == null || vehicleType == null) {
    return null;
  }

  if (!['Both', 'Bike', 'Car'].includes(vehicleType)) {
    return null;
  }

  if (vehicleType === 'Both') {
    return true;
  }

  if (trafficMarker.isBikeMarker && vehicleType === 'Bike') {
    return true;
  }

  return !trafficMarker.isBikeMarker && vehicleType === 'Car';
}

export function getDensityIconFromMarker(trafficMarker: TrafficMarker): Icon {
  if (trafficMarker == null) {
    return null;
  }

  const trafficVolume = trafficMarker.trafficDensity;

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

  const vehicle = trafficMarker.isBikeMarker ? 'Bikes' : 'Cars';
  const icon = getDensityIconFromMarker(trafficMarker);

  if (icon == null) {
    return null;
  }

  return marker(trafficMarker.coordinates, {riseOnHover: true, icon})
    .bindPopup(`Daily Volume: ${trafficMarker.trafficDensity} ${vehicle}`);
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
