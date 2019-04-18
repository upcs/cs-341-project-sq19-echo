import {icon, LatLngExpression, PointExpression} from 'leaflet';
import {IDensityInfo} from './home.component.interfaces';

export const DEFAULT_COORDS: LatLngExpression = [45.5122, -122.6587];

const ICON_SIZE: PointExpression = [10, 10];
const IMAGES_DIR = '../../assets/images/';

export const RED_ICON = icon({iconUrl: `${IMAGES_DIR}redMarker.png`, iconSize: ICON_SIZE});
export const ORANGE_ICON = icon({iconUrl: `${IMAGES_DIR}orangeMarker.png`, iconSize: ICON_SIZE});
export const GREEN_ICON = icon({iconUrl: `${IMAGES_DIR}greenMarker.png`, iconSize: ICON_SIZE});
export const DEFAULT_ICON = icon({iconUrl: `${IMAGES_DIR}marker-icon-2x.png`, iconSize: [25, 41]});
export const HOUSE_ICON = icon({iconUrl: `${IMAGES_DIR}houseMarker.png`, iconSize: [50, 50]});

export const DENSITIES: {[density: string]: IDensityInfo} = {
  All: {min: 0, max: 100000},
  High: {min: 5000, max: 100000},
  Medium: {min: 1000, max: 5000},
  Low: {min: 0, max: 1000}
};

export const AREAS: {[location: string]: LatLngExpression} = {
  All: DEFAULT_COORDS,
  North: [45.6075, -122.7236],
  South: [45.4886, -122.6755],
  Northwest: [45.5586, -122.7609],
  Northeast: [45.5676, -122.6179],
  Southwest: [45.4849, -122.7116],
  Southeast: [45.4914, -122.5930]
};

export const YEARS = ['All', '2019', '2018', '2017', '2016', '2015', '2014'];
export const VEHICLES = ['Both', 'Bike', 'Car'];
