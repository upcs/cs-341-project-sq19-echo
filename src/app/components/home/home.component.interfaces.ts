import {LatLngExpression} from 'leaflet';

export interface TrafficMarker {
  readonly startDate: string;
  readonly coordinates: LatLngExpression;
  readonly trafficDensity: number;
  readonly trafficLevel: string;
}

export interface PlanMarker {
  readonly projectName: string;
  readonly projectID: string;
  readonly coordinates: LatLngExpression;
  readonly projectDesc: string;
}

export interface DensityInfo {
  readonly min: number;
  readonly max: number;
}
