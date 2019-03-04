import {icon, PointExpression} from 'leaflet';
import {DensityInfo} from './home.component.interfaces';
import {TrafficDensity} from './home.component.enums';

const ICON_SIZE: PointExpression = [10, 10];
const IMAGES_DIR = '../../assets/images/';

export const RED_ICON = icon({iconUrl: `${IMAGES_DIR}redMarker.png`, iconSize: ICON_SIZE});
export const ORANGE_ICON = icon({iconUrl: `${IMAGES_DIR}orangeMarker.png`, iconSize: ICON_SIZE});
export const GREEN_ICON = icon({iconUrl: `${IMAGES_DIR}greenMarker.png`, iconSize: ICON_SIZE});

export const DENSITIES: {[density: string]: DensityInfo} = {
  [TrafficDensity.High]: {min: 5000, max: 100000},
  [TrafficDensity.Medium]: {min: 1000, max: 5000},
  [TrafficDensity.Low]: {min: 0, max: 1000}
};
