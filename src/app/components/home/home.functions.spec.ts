import {
  getCoordinateFromFeature,
  getDensityIconFromMarker,
  getFeatureStartDate,
  getLeafletMarkerFromTrafficMarker,
  getMarkersFromFeatures,
  getVehicleFilterFromVehicleSelector,
  inDensityRange,
  isBikeFeature,
  markerValidForVehicleFilter
} from './home.functions';

describe('getCoordinateFromFeature tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getCoordinateFromFeature(null)).toBe(null);
    expect(getCoordinateFromFeature(undefined)).toBe(null);
  });
});

describe('isBikeFeature tests', () => {
  test('null or undefined feature returns null', () => {
    expect(isBikeFeature(null)).toBe(null);
    expect(isBikeFeature(undefined)).toBe(null);
  });
});

describe('getVehicleFilterFromVehicleSelector tests', () => {
  test('null or undefined vehicle selector returns null', () => {
    expect(getVehicleFilterFromVehicleSelector(null)).toBe(null);
    expect(getVehicleFilterFromVehicleSelector(undefined)).toBe(null);
  });
});

describe('markerValidForVehicleFilter tests', () => {
  test('null or undefined traffic marker & vehicle filter returns null', () => {
    expect(markerValidForVehicleFilter(null, null)).toBe(null);
    expect(markerValidForVehicleFilter(undefined, undefined)).toBe(null);
    expect(markerValidForVehicleFilter(null, undefined)).toBe(null);
    expect(markerValidForVehicleFilter(undefined, null)).toBe(null);
  });
});

describe('getDensityIconFromMarker tests', () => {
  test('null or undefined traffic marker returns null', () => {
    expect(getDensityIconFromMarker(null)).toBe(null);
    expect(getDensityIconFromMarker(undefined)).toBe(null);
  });
});

describe('getFeatureStartDate tests', () => {
  test('null or undefined feature returns null', () => {
    expect(getFeatureStartDate(null)).toBe(null);
    expect(getFeatureStartDate(undefined)).toBe(null);
  });
});

describe('getMarkersFromFeatures tests', () => {
  test('null or undefined features returns null', () => {
    expect(getMarkersFromFeatures(null)).toBe(null);
    expect(getMarkersFromFeatures(undefined)).toBe(null);
  });
});

describe('inDensityRange tests', () => {
  test('null or undefined traffic density & density range returns null', () => {
    expect(inDensityRange(null, null)).toBe(null);
    expect(inDensityRange(undefined, undefined)).toBe(null);
    expect(inDensityRange(null, undefined)).toBe(null);
    expect(inDensityRange(undefined, null)).toBe(null);
  });
});

describe('getLeafletMarkerFromTrafficMarker tests', () => {
  test('null or undefined traffic marker returns null', () => {
    expect(getLeafletMarkerFromTrafficMarker(null)).toBe(null);
    expect(getLeafletMarkerFromTrafficMarker(undefined)).toBe(null);
  });
});
