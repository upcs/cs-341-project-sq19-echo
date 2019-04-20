import {icon, latLng, LatLng, latLngBounds, LatLngBounds, PointExpression} from 'leaflet';

const ICON_SIZE: PointExpression = [10, 10];
const IMAGES_DIR = '../../assets/images/';

export const RED_ICON = icon({iconUrl: `${IMAGES_DIR}redMarker.png`, iconSize: ICON_SIZE});
export const ORANGE_ICON = icon({iconUrl: `${IMAGES_DIR}orangeMarker.png`, iconSize: ICON_SIZE});
export const GREEN_ICON = icon({iconUrl: `${IMAGES_DIR}greenMarker.png`, iconSize: ICON_SIZE});
export const DEFAULT_ICON = icon({iconUrl: `${IMAGES_DIR}marker-icon-2x.png`, iconSize: [25, 41]});
export const HOUSE_ICON = icon({iconUrl: `${IMAGES_DIR}houseMarker.png`, iconSize: [50, 50]});

const BOUND_DELTA = 0.5;

export const DEFAULT_COORDS: LatLng = latLng(45.5122, -122.6587);
export const MAX_BOUNDS: LatLngBounds = latLngBounds(
  latLng(DEFAULT_COORDS.lat - BOUND_DELTA, DEFAULT_COORDS.lng - BOUND_DELTA),
  latLng(DEFAULT_COORDS.lat + BOUND_DELTA, DEFAULT_COORDS.lng + BOUND_DELTA)
);
