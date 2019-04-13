import {LatLngExpression, Marker, marker} from 'leaflet';
import {GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.component.constants';
import {MatSelect} from '@angular/material';
import {ISelectSqlQuery} from './home.component.interfaces';

export function getLeafletMarkerFromTrafficMarker(trafficMarker: any): Marker {
  if (trafficMarker == null) {
    return null;
  }

  const icon = trafficMarker.level === 'high' ? RED_ICON : trafficMarker.level === 'med' ? ORANGE_ICON : GREEN_ICON;

  if (icon == null) {
    return null;
  }

  const coordinates = [trafficMarker.lat, trafficMarker.lng] as LatLngExpression;

  return marker(coordinates, {riseOnHover: true, icon})
    .bindPopup(`Daily Volume: ${trafficMarker.volume} cars`);
}

export function valueSelectedBesidesAny(selector: MatSelect): boolean {
  return !selector.empty && selector.value !== 'Any';
}

export function selectSqlQuery(sqlQuery: ISelectSqlQuery): string {
  return `SELECT ${sqlQuery.whatToSelect} FROM ${sqlQuery.tableToSelectFrom} WHERE ${sqlQuery.whereStatements.join(' AND ')}`;
}
