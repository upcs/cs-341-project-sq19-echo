import {
  getCoordinateFromFeature,
  getDensityIconFromMarker,
  getFeatureAdtVolume,
  getFeatureStartDate,
  getLeafletMarkerFromTrafficMarker,
  getTrafficMarkersFromFeatures,
  inDensityRange,
  isBikeFeature,
  markerValidForVehicleFilter
} from './home.component.functions';
import {Feature} from 'geojson';
import {DensityInfo, TrafficMarker} from './home.component.interfaces';
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
const regularTrafficMarker: TrafficMarker = {
  coordinates: [-122.709663784461, 45.440062311819155],
  isBikeMarker: false,
  startDate: '2018-06-11T00:00:00.000Z',
  trafficDensity: 454
};

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
const bikeTrafficMarker: TrafficMarker = {
  coordinates: [-122.74278046217601, 45.58941353991535],
  isBikeMarker: true,
  startDate: '2015-06-30T00:00:00.000Z',
  trafficDensity: 68
};

const lowDensityInfo: DensityInfo = DENSITIES['Low'];
const mediumDensityInfo: DensityInfo = DENSITIES['Medium'];
const highDensityInfo: DensityInfo = DENSITIES['High'];

const trafficMarkerNullTrafficDensity: TrafficMarker = {
  startDate: '',
  trafficDensity: null,
  coordinates: [0, 0],
  isBikeMarker: false
};

const trafficMarkerUndefinedTrafficDensity: TrafficMarker = {
  startDate: '',
  trafficDensity: undefined,
  coordinates: [0, 0],
  isBikeMarker: false
};

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
    const featureMissingCoordinate: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    delete (featureMissingCoordinate.geometry as any).coordinates;

    expect(getCoordinateFromFeature(featureMissingCoordinate)).toBeNull();
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
    const featureMissingProperties: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingProperties.properties;

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
  test('null or undefined traffic marker & vehicle filter returns null', () => {
    expect(markerValidForVehicleFilter(null, null)).toBeNull();
    expect(markerValidForVehicleFilter(undefined, undefined)).toBeNull();
    expect(markerValidForVehicleFilter(null, undefined)).toBeNull();
    expect(markerValidForVehicleFilter(undefined, null)).toBeNull();
  });

  test('regular traffic marker should only return true for Car and Both vehicle types', () => {
    expect(markerValidForVehicleFilter(regularTrafficMarker, 'Car')).toBe(true);
    expect(markerValidForVehicleFilter(regularTrafficMarker, 'Both')).toBe(true);
    expect(markerValidForVehicleFilter(regularTrafficMarker, 'Bike')).toBe(false);
  });

  test('bike traffic marker should only return true for Bike and All vehicle types', () => {
    expect(markerValidForVehicleFilter(bikeTrafficMarker, 'Bike')).toBe(true);
    expect(markerValidForVehicleFilter(bikeTrafficMarker, 'Both')).toBe(true);
    expect(markerValidForVehicleFilter(bikeTrafficMarker, 'Car')).toBe(false);
  });

  test('bogus vehicle types return null for regular marker', () => {
    expect(markerValidForVehicleFilter(regularTrafficMarker, '')).toBeNull();
    expect(markerValidForVehicleFilter(regularTrafficMarker, 'testing')).toBeNull();
    expect(markerValidForVehicleFilter(regularTrafficMarker, 'bob')).toBeNull();
  });

  test('bogus vehicle types return null for bike marker', () => {
    expect(markerValidForVehicleFilter(bikeTrafficMarker, '')).toBeNull();
    expect(markerValidForVehicleFilter(bikeTrafficMarker, 'testing')).toBeNull();
    expect(markerValidForVehicleFilter(bikeTrafficMarker, 'bob')).toBeNull();
  });
});

describe('getDensityIconFromMarker tests', () => {
  test('null or undefined traffic marker returns null', () => {
    expect(getDensityIconFromMarker(null)).toBeNull();
    expect(getDensityIconFromMarker(undefined)).toBeNull();
  });

  test('traffic marker with null or undefined trafficDensity returns null', () => {
    expect(getDensityIconFromMarker(trafficMarkerNullTrafficDensity)).toBeNull();
    expect(getDensityIconFromMarker(trafficMarkerUndefinedTrafficDensity)).toBeNull();
  });

  test('traffic marker with high traffic density returns RED_ICON', () => {
    const trafficMarkerHighTrafficDensity: TrafficMarker = {
      startDate: '',
      trafficDensity: highDensityInfo.max - 1,
      coordinates: [0, 0],
      isBikeMarker: false
    };

    expect(getDensityIconFromMarker(trafficMarkerHighTrafficDensity)).toBe(RED_ICON);
  });

  test('traffic marker with medium traffic density returns ORANGE_ICON', () => {
    const trafficMarkerMediumTrafficDensity: TrafficMarker = {
      startDate: '',
      trafficDensity: mediumDensityInfo.max - 1,
      coordinates: [0, 0],
      isBikeMarker: false
    };

    expect(getDensityIconFromMarker(trafficMarkerMediumTrafficDensity)).toBe(ORANGE_ICON);
  });

  test('traffic marker with low traffic density returns GREEN_ICON', () => {
    const trafficMarkerLowTrafficDensity: TrafficMarker = {
      startDate: '',
      trafficDensity: lowDensityInfo.max - 1,
      coordinates: [0, 0],
      isBikeMarker: false
    };

    expect(getDensityIconFromMarker(trafficMarkerLowTrafficDensity)).toBe(GREEN_ICON);
  });
});

describe('getFeatureStartDate tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getFeatureStartDate(null)).toBeNull();
    expect(getFeatureStartDate(undefined)).toBeNull();
  });

  test('feature missing properties returns null', () => {
    const featureMissingProperties: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingProperties.properties;

    expect(getFeatureStartDate(featureMissingProperties)).toBeNull();
  });

  test('feature missing StartDate returns null', () => {
    const featureMissingStartDate: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingStartDate.properties.StartDate;

    expect(getFeatureStartDate(featureMissingStartDate)).toBeNull();
  });
});

describe('getMarkersFromFeatures tests', () => {
  test('null or undefined features returns empty list', () => {
    expect(getTrafficMarkersFromFeatures(null)).toEqual([]);
    expect(getTrafficMarkersFromFeatures(undefined)).toEqual([]);
  });

  test('regular feature example should return proper marker list', () => {
    expect(getTrafficMarkersFromFeatures([regularFeatureExample])).toEqual([regularTrafficMarker]);
  });

  test('bike feature example should return proper marker list', () => {
    expect(getTrafficMarkersFromFeatures([bikeFeatureExample])).toEqual([bikeTrafficMarker]);
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

describe('getLeafletMarkerFromTrafficMarker tests', () => {
  test('null or undefined traffic marker returns null', () => {
    expect(getLeafletMarkerFromTrafficMarker(null)).toBeNull();
    expect(getLeafletMarkerFromTrafficMarker(undefined)).toBeNull();
  });

  test('null or undefined trafficDensity in trafficMarker returns null', () => {
    expect(getLeafletMarkerFromTrafficMarker(trafficMarkerNullTrafficDensity)).toBeNull();
    expect(getLeafletMarkerFromTrafficMarker(trafficMarkerUndefinedTrafficDensity)).toBeNull();
  });

  test('regular traffic marker returns proper Leaflet marker', () => {
    const regularLeafletMarker: Marker = marker(regularTrafficMarker.coordinates, {riseOnHover: true, icon: GREEN_ICON})
      .bindPopup(`Daily Volume: ${regularTrafficMarker.trafficDensity} Cars`);

    expect(getLeafletMarkerFromTrafficMarker(regularTrafficMarker)).toEqual(regularLeafletMarker);
  });

  test('bike traffic marker returns proper Leaflet marker', () => {
    const bikeLeafletMarker: Marker = marker(bikeTrafficMarker.coordinates, {riseOnHover: true, icon: GREEN_ICON})
      .bindPopup(`Daily Volume: ${bikeTrafficMarker.trafficDensity} Bikes`);

    expect(getLeafletMarkerFromTrafficMarker(bikeTrafficMarker)).toEqual(bikeLeafletMarker);
  });
});

describe('getFeatureAdtVolume tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getFeatureAdtVolume(null)).toBeNull();
    expect(getFeatureAdtVolume(undefined)).toBeNull();
  });

  test('feature missing properties returns null', () => {
    const featureMissingProperties: Feature = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingProperties.properties;

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
