import {LatLngExpression} from 'leaflet';

export interface TrafficMarker {
  readonly startDate: string;
  readonly isBikeMarker: boolean;
  readonly coordinates: LatLngExpression;
  readonly trafficDensity: number;
}

export interface DensityInfo {
  readonly min: number;
  readonly max: number;
}
