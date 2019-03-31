var homeFunctions = require('./home.functions');
var marker = require('leaflet').marker;
var homeConstants = require('./home.constants');

var regularFeatureExample = {
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
var regularLeafletMarker = marker(
  regularFeatureExample.geometry.coordinates,
  {
    riseOnHover: true,
    icon: homeConstants.GREEN_ICON,
    title: regularFeatureExample.properties.StartDate + ' --> ' + regularFeatureExample.properties.ADTVolume
  }).bindPopup('Daily Volume: ' + regularFeatureExample.properties.ADTVolume + ' Cars');

var bikeFeatureExample = {
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
var bikeLeafletMarker = marker(
    bikeFeatureExample.geometry.coordinates,
    {
      riseOnHover: true,
      icon: homeConstants.GREEN_ICON,
      title: bikeFeatureExample.properties.StartDate + ' --> ' + bikeFeatureExample.properties.ADTVolume
    }).bindPopup('Daily Volume: ' + bikeFeatureExample.properties.ADTVolume + ' Bikes');

var lowDensityInfo = homeConstants.DENSITIES['Low'];
var mediumDensityInfo = homeConstants.DENSITIES['Medium'];
var highDensityInfo = homeConstants.DENSITIES['High'];

var featureMissingProperties = JSON.parse(JSON.stringify(regularFeatureExample));
delete featureMissingProperties.properties;

var featureMissingStartDate = JSON.parse(JSON.stringify(regularFeatureExample));
delete featureMissingStartDate.properties.StartDate;

var featureMissingCoordinates = JSON.parse(JSON.stringify(regularFeatureExample));
delete featureMissingCoordinates.geometry.coordinates;

describe('getCoordinateFromFeature tests', function () {
  test('null or undefined feature returns null', function () {
    expect(homeFunctions.getCoordinateFromFeature(null)).toBeNull();
    expect(homeFunctions.getCoordinateFromFeature(undefined)).toBeNull();
  });

  test('feature missing geometry returns null', function () {
    var featureMissingGeometry = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingGeometry.geometry;

    expect(homeFunctions.getCoordinateFromFeature(featureMissingGeometry)).toBeNull();
  });

  test('feature missing coordinates returns null', function () {
    expect(homeFunctions.getCoordinateFromFeature(featureMissingCoordinates)).toBeNull();
  });

  test('correctly formatted feature returns proper coordinate', function () {
    expect(homeFunctions.getCoordinateFromFeature(regularFeatureExample)).toEqual([45.440062311819155, -122.709663784461]);
    expect(homeFunctions.getCoordinateFromFeature(bikeFeatureExample)).toEqual([45.58941353991535, -122.74278046217601]);
  });
});

describe('isBikeFeature tests', function () {
  test('null or undefined feature returns null', function () {
    expect(homeFunctions.isBikeFeature(null)).toBeNull();
    expect(homeFunctions.isBikeFeature(undefined)).toBeNull();
  });

  test('feature missing properties returns null', function () {
    expect(homeFunctions.isBikeFeature(featureMissingProperties)).toBeNull();
  });

  test('non-bike feature returns false', function () {
    expect(homeFunctions.isBikeFeature(regularFeatureExample)).toBe(false);
  });

  test('bike feature returns true', function () {
    expect(homeFunctions.isBikeFeature(bikeFeatureExample)).toBe(true);
  });
});

describe('markerValidForVehicleFilter tests', function () {
  test('null or undefined leaflet marker & vehicle filter returns null', function () {
    expect(homeFunctions.markerValidForVehicleFilter(null, null)).toBeNull();
    expect(homeFunctions.markerValidForVehicleFilter(undefined, undefined)).toBeNull();
    expect(homeFunctions.markerValidForVehicleFilter(null, undefined)).toBeNull();
    expect(homeFunctions.markerValidForVehicleFilter(undefined, null)).toBeNull();
  });

  test('regular leaflet marker should only return true for "Car" and "Both" vehicle types', function () {
    expect(homeFunctions.markerValidForVehicleFilter(regularLeafletMarker, 'Car')).toBe(true);
    expect(homeFunctions.markerValidForVehicleFilter(regularLeafletMarker, 'Both')).toBe(true);
    expect(homeFunctions.markerValidForVehicleFilter(regularLeafletMarker, 'Bike')).toBe(false);
  });

  test('bike leaflet marker should only return true for "Bike" and "All" vehicle types', function () {
    expect(homeFunctions.markerValidForVehicleFilter(bikeLeafletMarker, 'Bike')).toBe(true);
    expect(homeFunctions.markerValidForVehicleFilter(bikeLeafletMarker, 'Both')).toBe(true);
    expect(homeFunctions.markerValidForVehicleFilter(bikeLeafletMarker, 'Car')).toBe(false);
  });

  test('bogus vehicle types return null for regular leaflet marker', function () {
    expect(homeFunctions.markerValidForVehicleFilter(regularLeafletMarker, '')).toBeNull();
    expect(homeFunctions.markerValidForVehicleFilter(regularLeafletMarker, 'testing')).toBeNull();
    expect(homeFunctions.markerValidForVehicleFilter(regularLeafletMarker, 'bob')).toBeNull();
  });

  test('bogus vehicle types return null for bike leaflet marker', function () {
    expect(homeFunctions.markerValidForVehicleFilter(bikeLeafletMarker, '')).toBeNull();
    expect(homeFunctions.markerValidForVehicleFilter(bikeLeafletMarker, 'testing')).toBeNull();
    expect(homeFunctions.markerValidForVehicleFilter(bikeLeafletMarker, 'bob')).toBeNull();
  });
});

describe('getDensityIconFromTrafficVolume tests', function () {
  test('null or undefined traffic volume returns null', function () {
    expect(homeFunctions.getDensityIconFromTrafficVolume(null)).toBeNull();
    expect(homeFunctions.getDensityIconFromTrafficVolume(undefined)).toBeNull();
  });

  test('null or undefined traffic volume returns null', function () {
    expect(homeFunctions.getDensityIconFromTrafficVolume(null)).toBeNull();
    expect(homeFunctions.getDensityIconFromTrafficVolume(undefined)).toBeNull();
  });

  test('high traffic volume returns RED_ICON', function () {
    expect(homeFunctions.getDensityIconFromTrafficVolume(highDensityInfo.max - 1))
        .toBe(homeConstants.RED_ICON);
  });

  test('medium traffic volume returns ORANGE_ICON', function () {
    expect(homeFunctions.getDensityIconFromTrafficVolume(mediumDensityInfo.max - 1))
        .toBe(homeConstants.ORANGE_ICON);
  });

  test('low traffic volume returns GREEN_ICON', function () {
    expect(homeFunctions.getDensityIconFromTrafficVolume(lowDensityInfo.max - 1))
        .toBe(homeConstants.GREEN_ICON);
  });
});

describe('getFeatureStartDate tests', function () {
  test('null or undefined feature returns null', function () {
    expect(homeFunctions.getFeatureStartDate(null)).toBeNull();
    expect(homeFunctions.getFeatureStartDate(undefined)).toBeNull();
  });

  test('feature missing properties returns null', function () {
    expect(homeFunctions.getFeatureStartDate(featureMissingProperties)).toBeNull();
  });

  test('feature missing StartDate returns null', function () {
    expect(homeFunctions.getFeatureStartDate(featureMissingStartDate)).toBeNull();
  });
});

describe('inDensityRange tests', function () {
  test('null or undefined traffic density & density range returns null', function () {
    expect(homeFunctions.inDensityRange(null, null)).toBeNull();
    expect(homeFunctions.inDensityRange(undefined, undefined)).toBeNull();
    expect(homeFunctions.inDensityRange(null, undefined)).toBeNull();
    expect(homeFunctions.inDensityRange(undefined, null)).toBeNull();
  });

  test('one above the minimum of the target density should return true', function () {
    expect(homeFunctions.inDensityRange(lowDensityInfo.min + 1, lowDensityInfo)).toBe(true);
    expect(homeFunctions.inDensityRange(mediumDensityInfo.min + 1, mediumDensityInfo)).toBe(true);
    expect(homeFunctions.inDensityRange(highDensityInfo.min + 1, highDensityInfo)).toBe(true);
  });

  test('one below the maximum of the target density should return true', function () {
    expect(homeFunctions.inDensityRange(lowDensityInfo.max - 1, lowDensityInfo)).toBe(true);
    expect(homeFunctions.inDensityRange(mediumDensityInfo.max - 1, mediumDensityInfo)).toBe(true);
    expect(homeFunctions.inDensityRange(highDensityInfo.max - 1, highDensityInfo)).toBe(true);
  });

  test('one above the maximum of the target density should return false', function () {
    expect(homeFunctions.inDensityRange(lowDensityInfo.max + 1, lowDensityInfo)).toBe(false);
    expect(homeFunctions.inDensityRange(mediumDensityInfo.max + 1, mediumDensityInfo)).toBe(false);
    expect(homeFunctions.inDensityRange(highDensityInfo.max + 1, highDensityInfo)).toBe(false);
  });

  test('one below the minimum of the target density should return false', function () {
    expect(homeFunctions.inDensityRange(lowDensityInfo.min - 1, lowDensityInfo)).toBe(false);
    expect(homeFunctions.inDensityRange(mediumDensityInfo.min - 1, mediumDensityInfo)).toBe(false);
    expect(homeFunctions.inDensityRange(highDensityInfo.min - 1, highDensityInfo)).toBe(false);
  });
});

describe('getLeafletMarkerFromFeature tests', function () {
  test('null or undefined feature returns null', function () {
    expect(homeFunctions.getLeafletMarkerFromFeature(null)).toBeNull();
    expect(homeFunctions.getLeafletMarkerFromFeature(undefined)).toBeNull();
  });

  test('null or undefined ADTVolume in feature returns null', function () {
    var regularFeatureDeepCopy = JSON.parse(JSON.stringify(regularFeatureExample));
    regularFeatureDeepCopy.properties.ADTVolume = null;
    expect(homeFunctions.getLeafletMarkerFromFeature(regularFeatureDeepCopy)).toBeNull();

    regularFeatureDeepCopy.properties.ADTVolume = undefined;
    expect(homeFunctions.getLeafletMarkerFromFeature(regularFeatureDeepCopy)).toBeNull();
  });

  test('regular feature returns proper Leaflet marker', function () {
    expect(homeFunctions.getLeafletMarkerFromFeature(regularFeatureExample)).toEqual(regularLeafletMarker);
  });

  test('bike feature returns proper Leaflet marker', function () {
    expect(homeFunctions.getLeafletMarkerFromFeature(bikeFeatureExample)).toEqual(bikeLeafletMarker);
  });

  test('feature missing properties returns null', function () {
    expect(homeFunctions.getLeafletMarkerFromFeature(featureMissingProperties)).toBeNull();
  });

  test('feature missing startDate returns null', function () {
    expect(homeFunctions.getLeafletMarkerFromFeature(featureMissingStartDate)).toBeNull();
  });

  test('feature missing coordinates returns null', function () {
    expect(homeFunctions.getLeafletMarkerFromFeature(featureMissingCoordinates)).toBeNull();
  });
});

describe('getFeatureAdtVolume tests', function () {
  test('null or undefined feature returns null', function () {
    expect(homeFunctions.getFeatureAdtVolume(null)).toBeNull();
    expect(homeFunctions.getFeatureAdtVolume(undefined)).toBeNull();
  });

  test('feature missing properties returns null', function () {
    expect(homeFunctions.getFeatureAdtVolume(featureMissingProperties)).toBeNull();
  });

  test('feature missing ADTVolume from properties returns null', function () {
    var featureMissingAdtVolume = JSON.parse(JSON.stringify(regularFeatureExample));
    delete featureMissingAdtVolume.properties.ADTVolume;

    expect(homeFunctions.getFeatureAdtVolume(featureMissingAdtVolume)).toBeNull();
  });

  test('properly formatted features correctly return ADTVolume', function () {
    expect(homeFunctions.getFeatureAdtVolume(regularFeatureExample)).toBe(454);
    expect(homeFunctions.getFeatureAdtVolume(bikeFeatureExample)).toBe(68);
  });
});

describe('getMarkerDictKey tests', function () {
  test('null or undefined area return null', function () {
    expect(homeFunctions.getMarkerDictKey(null, 'Bike', 'All', 'All')).toBeNull();
    expect(homeFunctions.getMarkerDictKey(undefined, 'Bike', 'All', 'All')).toBeNull();
  });

  test('null or undefined vehicle returns null', function () {
    expect(homeFunctions.getMarkerDictKey('All', null, 'All', 'All')).toBeNull();
    expect(homeFunctions.getMarkerDictKey('All', undefined, 'All', 'All')).toBeNull();
  });

  test('null or undefined year returns null', function () {
    expect(homeFunctions.getMarkerDictKey('All', 'Bike', null, 'All')).toBeNull();
    expect(homeFunctions.getMarkerDictKey('All', 'Bike', undefined, 'All')).toBeNull();
  });

  test('null or undefined density returns null', function () {
    expect(homeFunctions.getMarkerDictKey('All', 'Bike', 'All', null)).toBeNull();
    expect(homeFunctions.getMarkerDictKey('All', 'Bike', 'All', undefined)).toBeNull();
  });

  test('bogus attributes return null', function () {
    expect(homeFunctions.getMarkerDictKey('something', 'Bike', 'All', 'All')).toBeNull();
    expect(homeFunctions.getMarkerDictKey('All', 'testing', 'All', 'All')).toBeNull();
    expect(homeFunctions.getMarkerDictKey('All', 'Bike', 'another', 'All')).toBeNull();
    expect(homeFunctions.getMarkerDictKey('All', 'Bike', 'All', 'one')).toBeNull();
  });

  test('proper attributes return a proper key', function () {
    expect(homeFunctions.getMarkerDictKey('All', 'Bike', 'All', 'High')).toBe('All:Bike:All:High');
    expect(homeFunctions.getMarkerDictKey('North', 'Car', '2018', 'Low')).toBe('North:Car:2018:Low');
  });
});

describe('getTrafficDensityFromLeafletMarker tests', function () {
  test('null or undefined leaflet marker returns null', function () {
    expect(homeFunctions.getTrafficDensityFromLeafletMarker(null)).toBeNull();
    expect(homeFunctions.getTrafficDensityFromLeafletMarker(undefined)).toBeNull();
  });

  test('regular leaflet marker returns proper traffic density', function () {
    expect(homeFunctions.getTrafficDensityFromLeafletMarker(regularLeafletMarker)).toBe(regularFeatureExample.properties.ADTVolume);
  });

  test('bike leaflet marker returns proper traffic density', function () {
    expect(homeFunctions.getTrafficDensityFromLeafletMarker(bikeLeafletMarker)).toBe(bikeFeatureExample.properties.ADTVolume);
  });
});

describe('getLeafletMarkerDict tests', function () {
  test('null or undefined list of features returns null', function () {
    expect(homeFunctions.getLeafletMarkerDict(null)).toBeNull();
    expect(homeFunctions.getLeafletMarkerDict(undefined)).toBeNull();
  });

  test('regular feature should return a proper dictionary', function () {
    expect(homeFunctions.getLeafletMarkerDict([regularFeatureExample])).toBeTruthy();
  });

  test('bike feature should return a proper dictionary', function () {
    expect(homeFunctions.getLeafletMarkerDict([bikeFeatureExample])).toBeTruthy();
  });

  test('both features should return a proper dictionary', function () {
    expect(homeFunctions.getLeafletMarkerDict([regularFeatureExample, bikeFeatureExample])).toBeTruthy();
  });
});
