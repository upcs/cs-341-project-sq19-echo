import {getLeafletMarkerFromTrafficMarker,} from './home.component.functions';
import {GREEN_ICON} from './home.component.constants';
import {LatLngExpression, Marker, marker} from 'leaflet';


const regularTrafficMarker: any = {
  lat: -122.709663784461,
  lng: 45.440062311819155,
  level: 'low',
  volume: 100
};

describe('getLeafletMarkerFromTrafficMarker tests', () => {
  test('null or undefined traffic marker returns null', () => {
    expect(getLeafletMarkerFromTrafficMarker(null)).toBeNull();
    expect(getLeafletMarkerFromTrafficMarker(undefined)).toBeNull();
  });

  test('regular traffic marker returns proper Leaflet marker', () => {
    const regularLeafletMarker: Marker = marker(
      [regularTrafficMarker.lat, regularTrafficMarker.lng] as LatLngExpression, {riseOnHover: true, icon: GREEN_ICON}
    ).bindPopup(`Daily Volume: ${regularTrafficMarker.volume} cars`);

    expect(getLeafletMarkerFromTrafficMarker(regularTrafficMarker)).toEqual(regularLeafletMarker);
  });
});
