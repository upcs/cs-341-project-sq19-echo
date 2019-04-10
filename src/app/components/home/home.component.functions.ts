import {Feature} from 'geojson';
import {Icon, LatLngExpression, Marker, marker} from 'leaflet';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON, DEFAULT_ICON} from './home.component.constants';

export function getLeafletMarkerFromTrafficMarker(trafficMarker: any): Marker {
  if (trafficMarker == null) {
    return null;
  }

  const icon = trafficMarker.level == 'high' ? RED_ICON : trafficMarker.level == 'med' ? ORANGE_ICON : GREEN_ICON;

  if (icon == null) {
    return null;
  }

  const coordinates = [trafficMarker.lat, trafficMarker.lng] as LatLngExpression;

  return marker(coordinates, {riseOnHover: true, icon})
    .bindPopup(`Daily Volume: ${trafficMarker.volume} cars`);
}
