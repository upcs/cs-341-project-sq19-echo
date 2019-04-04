import {
  getCoordinateFromFeature,
  getDensityIconFromTrafficVolume,
  getFeatureAdtVolume,
  getFeatureStartDate, getLeafletMarkerDict,
  getLeafletMarkerFromFeature, getMarkerDictKey, getTrafficDensityFromLeafletMarker,
  inDensityRange,
  isBikeFeature, 
  markerValidForVehicleFilter
} from './home.component.functions';
import {Feature} from 'geojson';
import {DensityInfo} from './home.component.interfaces';
import {DENSITIES, GREEN_ICON, ORANGE_ICON, RED_ICON} from './home.component.constants';
import {marker, Marker} from 'leaflet';

const regularFeatureExample: Feature = {
  type: 'Feature',
  properties: {
    OBJECTID: 1,
    CountID: '18061114.VL2',
    ChannelID: 520118,
    LocationDesc: 'EAGLE CREST DR S of STEPHENSON ST',
    Bound: 'N',
    StartDate: '2018-06-11T00:00:00.000Z',
    StartDay: 'MON',
    StartTime: '12:30:00',
    EndDate: '2018-06-14T00:00:00.000Z',
    EndDay: 'THU',
    EndTime: '08:30:00',
    ADTVolume: 454,
    AMVolume: 193,
    AMPkHrVol: 48,
    AMPkHrTime: '2018-06-11T07:15:00.000Z',
    AMPkHrFactor: 0.75,
    PMVolume: 261,
    PMPkHrVol: 38,
    PMPkHrTime: '2018-06-11T17:15:00.000Z',
    PMPkHrFactor: 0.864,
    ExceptType: 'Normal Weekday',
    NumChannels: 2,
    ChannelNum: 1,
    Conditions: '',
    Comment: '',
    Duration: 273,
    IntervalLen: 15,
    DeviceRef: '',
    LocationID: 'LEG77374',
    LocationClass: 'NODELEG',
    CountLocDesc: 'SW EAGLE CREST DR S of SW STEPHENSON ST',
    CountType: 'VOLUME'
  },
  geometry: {
    type: 'Point',
    coordinates: [
      -122.709663784461,
      45.440062311819155
    ]
  }
};
const regularLeafletMarker: Marker = marker(
  (regularFeatureExample.geometry as any).coordinates,
  {
    riseOnHover: true,
    icon: GREEN_ICON,
    title: `${regularFeatureExample.properties.StartDate} --> ${regularFeatureExample.properties.ADTVolume}`
  }).bindPopup(`Daily Volume: ${regularFeatureExample.properties.ADTVolume} Cars`);

const bikeFeatureExample: Feature = {
  type: 'Feature',
  properties: {
    OBJECTID: 68,
    CountID: '15063073.VL2',
    ChannelID: 515565,
    LocationDesc: 'N CENTRAL ST E of BUCHANAN AVE',
    Bound: 'E',
    StartDate: '2015-06-30T00:00:00.000Z',
    StartDay: 'TUE',
    StartTime: '12:15:00',
    EndDate: '2015-07-03T00:00:00.000Z',
    EndDay: 'FRI',
    EndTime: '11:45:00',
    ADTVolume: 68,
    AMVolume: 22,
    AMPkHrVol: 7,
    AMPkHrTime: '2015-06-30T08:30:00.000Z',
    AMPkHrFactor: 0.583,
    PMVolume: 46,
    PMPkHrVol: 7,
    PMPkHrTime: '2015-06-30T16:30:00.000Z',
    PMPkHrFactor: 0.875,
    ExceptType: 'Bike Count',
    NumChannels: 2,
    ChannelNum: 1,
    Conditions: '',
    Comment: 'BIKE ONLY',
    Duration: 287,
    IntervalLen: 15,
    DeviceRef: '',
    LocationID: 'LEG7360',
    LocationClass: 'NODELEG',
    CountLocDesc: 'N CENTRAL ST E of N BUCHANAN AVE',
    CountType: 'VOLUME'
  },
  geometry: {
    type: 'Point',
    coordinates: [
      -122.74278046217601,
      45.58941353991535
    ]
  }
};
const bikeLeafletMarker: Marker = marker(
  (bikeFeatureExample.geometry as any).coordinates,
  {
    riseOnHover: true,
    icon: GREEN_ICON,
    title: `${bikeFeatureExample.properties.StartDate} --> ${bikeFeatureExample.properties.ADTVolume}`
  }).bindPopup(`Daily Volume: ${bikeFeatureExample.properties.ADTVolume} Bikes`);

const lowDensityInfo: DensityInfo = DENSITIES['Low'];
const mediumDensityInfo: DensityInfo = DENSITIES['Medium'];
const highDensityInfo: DensityInfo = DENSITIES['High'];

const featureMissingProperties: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
delete featureMissingProperties.properties;

const featureMissingStartDate: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
delete featureMissingStartDate.properties.StartDate;

const featureMissingCoordinates: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
delete (featureMissingCoordinates.geometry as any).coordinates;

describe('getCoordinateFromFeature tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getCoordinateFromFeature(null)).toBeNull();
    expect(getCoordinateFromFeature(undefined)).toBeNull();
  });

  test('feature missing geometry returns null', () => {
    const featureMissingGeometry: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingGeometry.geometry;

    expect(getCoordinateFromFeature(featureMissingGeometry)).toBeNull();
  });

  test('feature missing coordinates returns null', () => {
    expect(getCoordinateFromFeature(featureMissingCoordinates)).toBeNull();
  });

  test('correctly formatted feature returns proper coordinate', () => {
    expect(getCoordinateFromFeature(regularFeatureExample)).toEqual([45.440062311819155, -122.709663784461]);
    expect(getCoordinateFromFeature(bikeFeatureExample)).toEqual([45.58941353991535, -122.74278046217601]);
  });
});

describe('isBikeFeature tests', () => {
  test('null or undefined feature returns null', () => {
    expect(isBikeFeature(null)).toBeNull();
    expect(isBikeFeature(undefined)).toBeNull();
  });

  test('feature missing properties returns null', () => {
    expect(isBikeFeature(featureMissingProperties)).toBeNull();
  });

  test('non-bike feature returns false', () => {
    expect(isBikeFeature(regularFeatureExample)).toBe(false);
  });

  test('bike feature returns true', () => {
    expect(isBikeFeature(bikeFeatureExample)).toBe(true);
  });
});

describe('markerValidForVehicleFilter tests', () => {
  test('null or undefined leaflet marker & vehicle filter returns null', () => {
    expect(markerValidForVehicleFilter(null, null)).toBeNull();
    expect(markerValidForVehicleFilter(undefined, undefined)).toBeNull();
    expect(markerValidForVehicleFilter(null, undefined)).toBeNull();
    expect(markerValidForVehicleFilter(undefined, null)).toBeNull();
  });

  test('regular leaflet marker should only return true for "Car" and "Both" vehicle types', () => {
    expect(markerValidForVehicleFilter(regularLeafletMarker, 'Car')).toBe(true);
    expect(markerValidForVehicleFilter(regularLeafletMarker, 'Both')).toBe(true);
    expect(markerValidForVehicleFilter(regularLeafletMarker, 'Bike')).toBe(false);
  });

  test('bike leaflet marker should only return true for "Bike" and "All" vehicle types', () => {
    expect(markerValidForVehicleFilter(bikeLeafletMarker, 'Bike')).toBe(true);
    expect(markerValidForVehicleFilter(bikeLeafletMarker, 'Both')).toBe(true);
    expect(markerValidForVehicleFilter(bikeLeafletMarker, 'Car')).toBe(false);
  });

  test('bogus vehicle types return null for regular leaflet marker', () => {
    expect(markerValidForVehicleFilter(regularLeafletMarker, '')).toBeNull();
    expect(markerValidForVehicleFilter(regularLeafletMarker, 'testing')).toBeNull();
    expect(markerValidForVehicleFilter(regularLeafletMarker, 'bob')).toBeNull();
  });

  test('bogus vehicle types return null for bike leaflet marker', () => {
    expect(markerValidForVehicleFilter(bikeLeafletMarker, '')).toBeNull();
    expect(markerValidForVehicleFilter(bikeLeafletMarker, 'testing')).toBeNull();
    expect(markerValidForVehicleFilter(bikeLeafletMarker, 'bob')).toBeNull();
  });
});

describe('getDensityIconFromTrafficVolume tests', () => {
  test('null or undefined traffic volume returns null', () => {
    expect(getDensityIconFromTrafficVolume(null)).toBeNull();
    expect(getDensityIconFromTrafficVolume(undefined)).toBeNull();
  });

  test('null or undefined traffic volume returns null', () => {
    expect(getDensityIconFromTrafficVolume(null)).toBeNull();
    expect(getDensityIconFromTrafficVolume(undefined)).toBeNull();
  });

  test('high traffic volume returns RED_ICON', () => {
    expect(getDensityIconFromTrafficVolume(highDensityInfo.max - 1)).toBe(RED_ICON);
  });

  test('medium traffic volume returns ORANGE_ICON', () => {
    expect(getDensityIconFromTrafficVolume(mediumDensityInfo.max - 1)).toBe(ORANGE_ICON);
  });

  test('low traffic volume returns GREEN_ICON', () => {
    expect(getDensityIconFromTrafficVolume(lowDensityInfo.max - 1)).toBe(GREEN_ICON);
  });
});

describe('getFeatureStartDate tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getFeatureStartDate(null)).toBeNull();
    expect(getFeatureStartDate(undefined)).toBeNull();
  });

  test('feature missing properties returns null', () => {
    expect(getFeatureStartDate(featureMissingProperties)).toBeNull();
  });

  test('feature missing StartDate returns null', () => {
    expect(getFeatureStartDate(featureMissingStartDate)).toBeNull();
  });
});

describe('inDensityRange tests', () => {
  test('null or undefined traffic density & density range returns null', () => {
    expect(inDensityRange(null, null)).toBeNull();
    expect(inDensityRange(undefined, undefined)).toBeNull();
    expect(inDensityRange(null, undefined)).toBeNull();
    expect(inDensityRange(undefined, null)).toBeNull();
  });

  test('one above the minimum of the target density should return true', () => {
    expect(inDensityRange(lowDensityInfo.min + 1, lowDensityInfo)).toBe(true);
    expect(inDensityRange(mediumDensityInfo.min + 1, mediumDensityInfo)).toBe(true);
    expect(inDensityRange(highDensityInfo.min + 1, highDensityInfo)).toBe(true);
  });

  test('one below the maximum of the target density should return true', () => {
    expect(inDensityRange(lowDensityInfo.max - 1, lowDensityInfo)).toBe(true);
    expect(inDensityRange(mediumDensityInfo.max - 1, mediumDensityInfo)).toBe(true);
    expect(inDensityRange(highDensityInfo.max - 1, highDensityInfo)).toBe(true);
  });

  test('one above the maximum of the target density should return false', () => {
    expect(inDensityRange(lowDensityInfo.max + 1, lowDensityInfo)).toBe(false);
    expect(inDensityRange(mediumDensityInfo.max + 1, mediumDensityInfo)).toBe(false);
    expect(inDensityRange(highDensityInfo.max + 1, highDensityInfo)).toBe(false);
  });

  test('one below the minimum of the target density should return false', () => {
    expect(inDensityRange(lowDensityInfo.min - 1, lowDensityInfo)).toBe(false);
    expect(inDensityRange(mediumDensityInfo.min - 1, mediumDensityInfo)).toBe(false);
    expect(inDensityRange(highDensityInfo.min - 1, highDensityInfo)).toBe(false);
  });
});

describe('getLeafletMarkerFromFeature tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getLeafletMarkerFromFeature(null)).toBeNull();
    expect(getLeafletMarkerFromFeature(undefined)).toBeNull();
  });

  test('null or undefined ADTVolume in feature returns null', () => {
    const regularFeatureDeepCopy: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    regularFeatureDeepCopy.properties.ADTVolume = null;
    expect(getLeafletMarkerFromFeature(regularFeatureDeepCopy)).toBeNull();

    regularFeatureDeepCopy.properties.ADTVolume = undefined;
    expect(getLeafletMarkerFromFeature(regularFeatureDeepCopy)).toBeNull();
  });

  test('regular feature returns proper Leaflet marker', () => {
    expect(getLeafletMarkerFromFeature(regularFeatureExample)).toEqual(regularLeafletMarker);
  });

  test('bike feature returns proper Leaflet marker', () => {
    expect(getLeafletMarkerFromFeature(bikeFeatureExample)).toEqual(bikeLeafletMarker);
  });

  test('feature missing properties returns null', () => {
    expect(getLeafletMarkerFromFeature(featureMissingProperties)).toBeNull();
  });

  test('feature missing startDate returns null', () => {
    expect(getLeafletMarkerFromFeature(featureMissingStartDate)).toBeNull();
  });

  test('feature missing coordinates returns null', () => {
    expect(getLeafletMarkerFromFeature(featureMissingCoordinates)).toBeNull();
  });
});

describe('getFeatureAdtVolume tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getFeatureAdtVolume(null)).toBeNull();
    expect(getFeatureAdtVolume(undefined)).toBeNull();
  });

  test('feature missing properties returns null', () => {
    expect(getFeatureAdtVolume(featureMissingProperties)).toBeNull();
  });

  test('feature missing ADTVolume from properties returns null', () => {
    const featureMissingAdtVolume: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingAdtVolume.properties.ADTVolume;

    expect(getFeatureAdtVolume(featureMissingAdtVolume)).toBeNull();
  });

  test('properly formatted features correctly return ADTVolume', () => {
    expect(getFeatureAdtVolume(regularFeatureExample)).toBe(454);
    expect(getFeatureAdtVolume(bikeFeatureExample)).toBe(68);
  });
});

describe('getMarkerDictKey tests', () => {
  test('null or undefined area return null', () => {
    expect(getMarkerDictKey(null, 'Bike', 'All', 'All')).toBeNull();
    expect(getMarkerDictKey(undefined, 'Bike', 'All', 'All')).toBeNull();
  });
  test('null or undefined area return null', () => {
    expect(getMarkerDictKey(null, null, 'All', 'All')).toBeNull();
    expect(getMarkerDictKey(undefined, undefined, 'All', 'All')).toBeNull();
  });

  test('null or undefined vehicle returns null', () => {
    expect(getMarkerDictKey('All', null, null, 'All')).toBeNull();
    expect(getMarkerDictKey('All', undefined, undefined, 'All')).toBeNull();
  });
  test('null or undefined area return null', () => {
    expect(getMarkerDictKey('All', 'Bike', null, undefined)).toBeNull();
    expect(getMarkerDictKey('All', 'Bike', null, undefined)).toBeNull();
  });
  test('null or undefined year returns null', () => {
    expect(getMarkerDictKey('All', 'Bike', null, 'All')).toBeNull();
    expect(getMarkerDictKey('All', 'Bike', undefined, 'All')).toBeNull();
  });

  test('null or undefined density returns null', () => {
    expect(getMarkerDictKey('All', 'Bike', 'All', null)).toBeNull();
    expect(getMarkerDictKey('All', 'Bike', 'All', undefined)).toBeNull();
  });

  test('bogus attributes return null', () => {
    expect(getMarkerDictKey('something', 'Bike', 'All', 'All')).toBeNull();
    expect(getMarkerDictKey('All', 'testing', 'All', 'All')).toBeNull();
    expect(getMarkerDictKey('All', 'Bike', 'another', 'All')).toBeNull();
    expect(getMarkerDictKey('All', 'Bike', 'All', 'one')).toBeNull();
  });

  test('proper attributes return a proper key', () => {
    expect(getMarkerDictKey('All', 'Car', '2018', 'High')).toBe('All:Car:2018:High');
    expect(getMarkerDictKey('North', 'Car', '2018', 'High')).toBe('North:Car:2018:High');
    expect(getMarkerDictKey('South', 'Car', '2018', 'High')).toBe('South:Car:2018:High');
    expect(getMarkerDictKey('East', 'Car', '2018', 'High')).toBe('East:Car:2018:High');
    expect(getMarkerDictKey('All', 'Car', '2018', 'High')).toBe('All:Car:2018:High');
    expect(getMarkerDictKey('North', 'Car', '2018', 'High')).toBe('North:Car:2018:High');
    expect(getMarkerDictKey('South', 'Car', '2018', 'High')).toBe('South:Car:2018:High');
    expect(getMarkerDictKey('West', 'Car', '2018', 'High')).toBe('West:Car:2018:High');
    expect(getMarkerDictKey('East', 'Car', '2018', 'High')).toBe('East:Car:2018:High');
    expect(getMarkerDictKey('North', 'Car', 'All', 'High')).toBe('North:Car:All:High');
    expect(getMarkerDictKey('West', 'Car', 'All', 'High')).toBe('West:Car:All:High');
    expect(getMarkerDictKey('North', 'Car', 'All', 'Low')).toBe('North:Car:All:Low');
    expect(getMarkerDictKey('West', 'Car', '2018', 'Low')).toBe('West:Car:2018:Low');

    
    
  });
});

describe('getTrafficDensityFromLeafletMarker tests', () => {
  test('null or undefined leaflet marker returns null', () => {
    expect(getTrafficDensityFromLeafletMarker(null)).toBeNull();
    expect(getTrafficDensityFromLeafletMarker(undefined)).toBeNull();
  });

  test('regular leaflet marker returns proper traffic density', () => {
    expect(getTrafficDensityFromLeafletMarker(regularLeafletMarker)).toBe(regularFeatureExample.properties.ADTVolume);
  });

  test('bike leaflet marker returns proper traffic density', () => {
    expect(getTrafficDensityFromLeafletMarker(bikeLeafletMarker)).toBe(bikeFeatureExample.properties.ADTVolume);
  });
});

describe('getLeafletMarkerDict tests', () => {
  test('null or undefined list of features returns null', () => {
    expect(getLeafletMarkerDict(null)).toBeNull();
    expect(getLeafletMarkerDict(undefined)).toBeNull();
  });

  test('regular feature should return a proper dictionary', () => {
    expect(getLeafletMarkerDict([regularFeatureExample])).toBeTruthy();
  });

  test('bike feature should return a proper dictionary', () => {
    expect(getLeafletMarkerDict([bikeFeatureExample])).toBeTruthy();
  });
  test('bike feature should return a proper dictionary', () => {
    expect(getLeafletMarkerDict([null, null])).toBeNull();
  });
  test('bike feature should return a proper dictionary', () => {
    expect(getLeafletMarkerDict([null])).toBeNull();
  });

  test('both features should return a proper dictionary', () => {
    expect(getLeafletMarkerDict([regularFeatureExample, bikeFeatureExample])).toBeTruthy();
  });
});


