import {getCoordinateFromFeature} from "./home.functions";

describe('getCoordinateFromFeature tests', () => {
  test('null feature returns null', () => {
    expect(getCoordinateFromFeature(null)).toBe(null);
  });

  test('undefined feature returns null', () => {
    expect(getCoordinateFromFeature(undefined)).toBe(null);
  });
});

describe('isBikeFeature tests', () => {
});

describe('getDensityIconFromMarker tests', () => {
});

describe('getFeatureStartDate tests', () => {
});

describe('getMarkersFromFeatures tests', () => {
});

describe('inDensityRange tests', () => {
});
