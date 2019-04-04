import {
  getCoordinateFromFeature,
  getDensityIconFromMarker,
  getFeatureAdtVolume,
  getFeatureStartDate,
  getLeafletMarkerFromTrafficMarker,
  getTrafficMarkersFromFeatures,
  getVehicleFilterFromVehicleSelectorValue,
  inDensityRange,
  isBikeFeature,
  markerValidForVehicleFilter
} from './home.component.functions';
import {Feature} from 'geojson';
import {TrafficDensity, VehicleFilter, VehicleType} from './home.component.enums';
import {DensityInfo, TrafficMarker} from './home.component.interfaces';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.component.constants';
import {marker, Marker, LatLngExpression} from 'leaflet';


const regularTrafficMarker: TrafficMarker = {
  lat: -122.709663784461, 
  lng: 45.440062311819155,
  level: 'medium',
  volume: 2000
  };


const lowDensityInfo: DensityInfo = DENSITIES[TrafficDensity.Low];
const mediumDensityInfo: DensityInfo = DENSITIES[TrafficDensity.Medium];
const highDensityInfo: DensityInfo = DENSITIES[TrafficDensity.High];

const trafficMarkerNullTrafficDensity: TrafficMarker = {
  volume: 0,
  level: '',
  lat: 0,
  lng: 0,
};

const trafficMarkerUndefinedTrafficDensity: TrafficMarker = {
  volume: 500,
  level: undefined,
  coordinates: [0, 0],
  isBikeMarker: false
};

describe('getLeafletMarkerFromTrafficMarker tests', () => {
  test('null or undefined traffic marker returns null', () => {
    expect(getLeafletMarkerFromTrafficMarker(null)).toBeNull();
    expect(getLeafletMarkerFromTrafficMarker(undefined)).toBeNull();
  });

  test('regular traffic marker returns proper Leaflet marker', () => {
    const regularLeafletMarker: Marker = marker([regularTrafficMarker.lat, regularTrafficMarker.lng] as LatLngExpression, {riseOnHover: true, icon: ORANGE_ICON})
      .bindPopup(`Daily Volume: ${regularTrafficMarker.volume} cars`);

    expect(getLeafletMarkerFromTrafficMarker(regularTrafficMarker)).toEqual(regularLeafletMarker);
  });
});
