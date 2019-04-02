var ICON_SIZE = [10, 10];
var IMAGES_DIR = '../../assets/images/';

var DEFAULT_COORDS = [45.5122, -122.6587];
var DEFAULT_ZOOM = 11;

var RED_ICON = {iconUrl: IMAGES_DIR + 'redMarker.png', iconSize: ICON_SIZE};
var ORANGE_ICON = {iconUrl: IMAGES_DIR + 'orangeMarker.png', iconSize: ICON_SIZE};
var GREEN_ICON = {iconUrl: IMAGES_DIR + 'greenMarker.png', iconSize: ICON_SIZE};
var DEFAULT_ICON = {iconUrl: IMAGES_DIR + 'marker-icon-2x.png', iconSize: [25, 41]};

var DENSITIES = {
  All: {min: 0, max: 100000},
  High: {min: 5000, max: 100000},
  Medium: {min: 1000, max: 5000},
  Low: {min: 0, max: 1000}
};

var AREAS = {
  All: DEFAULT_COORDS,
  North: [45.6075, -122.7236],
  South: [45.4886, -122.6755],
  Northwest: [45.5586, -122.7609],
  Northeast: [45.5676, -122.6179],
  Southwest: [45.4849, -122.7116],
  Southeast: [45.4914, -122.5930]
};

var YEARS = ['All', '2019', '2018', '2017', '2016', '2015', '2014'];
var VEHICLES = ['Both', 'Bike', 'Car'];
