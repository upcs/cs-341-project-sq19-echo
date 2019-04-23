import {latLng, LatLngBounds, latLngBounds, LatLngExpression, LayerGroup, Marker, marker, rectangle} from 'leaflet';
import {GREEN_ICON, NUM_BUCKETS, ORANGE_ICON, RED_ICON} from './home.component.constants';
import {IBounds, IBucket, IBucketSize, ILocation, ITrafficData, IZillowNeighborhood} from './home.component.interfaces';

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

export function alphaNumericSpacebarOrBackspaceSelected(keyCode: number): boolean {
  if (keyCode === 8) {
    return true;
  }

  if (keyCode === 32) {
    return true;
  }

  if (keyCode >= 48 && keyCode <= 57) {
    return true;
  }

  return keyCode >= 65 && keyCode <= 90;
}

/**
 *  Source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
export function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export function rgbToHex(red: number, green: number, blue: number): string {
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
}

export function getBucketIndices(location: ILocation, bounds: IBounds, bucketSize: IBucketSize): ILocation {
  return {
    lng: Math.floor((location.lng - bounds.left) / bucketSize.width),
    lat: Math.floor((location.lat - bounds.bottom) / bucketSize.height)
  };
}

export function getBounds(mapBounds: LatLngBounds): IBounds {
  return {
    top: mapBounds.getNorth(),
    right: mapBounds.getEast(),
    bottom: mapBounds.getSouth(),
    left: mapBounds.getWest()
  };
}

export function getColorForPriceBucket(priceBucket: IBucket): string {
  const average = priceBucket.sum / priceBucket.count;

  let adjustedAvg;
  if (average >= 700000) {
    adjustedAvg = 510;
  } else {
    adjustedAvg = Math.round((average - 100000) / (600000 / 510));
  }

  let redValue;
  if (adjustedAvg <= 255) {
    redValue = 0;
  } else {
    redValue = adjustedAvg - 255;
  }

  let greenValue;
  if (adjustedAvg >= 255) {
    greenValue = 0;
  } else {
    greenValue = 255 - adjustedAvg;
  }

  return rgbToHex(redValue, greenValue, 255);
}

export function getColorForTrafficBucket(trafficBucket: IBucket): string {
  const average = trafficBucket.sum / trafficBucket.count;

  let adjustedAvg;
  if (average > 5100) {
    adjustedAvg = 510;
  } else {
    adjustedAvg = Math.round(average / 10);
  }

  let redValue;
  if (adjustedAvg > 255) {
    redValue = 255;
  } else {
    redValue = adjustedAvg;
  }

  let greenValue;
  if (adjustedAvg <= 255) {
    greenValue = 255;
  } else {
    greenValue = 510 - adjustedAvg;
  }

  return rgbToHex(redValue, greenValue, 0);
}

export function getTrafficBucketArray(trafficData: ITrafficData[], bounds: IBounds): IBucket[][] {
  const trafficBuckets = getBucketArray();
  const bucketSize = getBucketSize(bounds);

  for (const point of trafficData) {
    const bucketIndices = getBucketIndices(point, bounds, bucketSize);
    trafficBuckets[bucketIndices.lng][bucketIndices.lat].sum += point.volume;
    trafficBuckets[bucketIndices.lng][bucketIndices.lat].count++;
  }

  return trafficBuckets;
}

export function getPriceBucketArray(neighborhoods: IZillowNeighborhood[], bounds: IBounds): IBucket[][] {
  const priceBuckets = getBucketArray();
  const bucketSize = getBucketSize(bounds);

  for (const point of neighborhoods) {
    if (point.lat > bounds.bottom && point.lat < bounds.top && point.lng > bounds.left && point.lng < bounds.right) {
      const bucketIndices: ILocation = getBucketIndices(point, bounds, bucketSize);
      priceBuckets[bucketIndices.lng][bucketIndices.lat].sum += point.zindex;
      priceBuckets[bucketIndices.lng][bucketIndices.lat].count++;
    }
  }

  return priceBuckets;
}

export function getLayer(bucketArray: IBucket[][], bounds: IBounds, colorFunction: (bucket: IBucket) => string): LayerGroup {
  const layerToReturn: LayerGroup = new LayerGroup();

  const bucketSize = getBucketSize(bounds);
  for (let i = 0; i < bucketArray.length; i++) {
    for (let j = 0; j < bucketArray[0].length; j++) {
      const bucket = bucketArray[i][j];
      if (bucket.count === 0) {
        continue;
      }

      const leftRectBound = bounds.left + i * bucketSize.width;
      const bottomRectBound = bounds.bottom + j * bucketSize.height;
      rectangle(
        latLngBounds(
          latLng(bottomRectBound + bucketSize.height, leftRectBound),
          latLng(bottomRectBound, leftRectBound + bucketSize.width)
        ), {color: colorFunction(bucket), weight: 0, fillOpacity: 0.35}
      ).addTo(layerToReturn);
    }
  }

  return layerToReturn;
}

export function getBucketArray(): IBucket[][] {
  return Array.from(
    {length: NUM_BUCKETS}, () => Array.from({length: NUM_BUCKETS}, () => ({sum: 0, count: 0}))
  );
}

export function getBucketSize(bounds: IBounds): IBucketSize {
  return {
    width: (bounds.right - bounds.left) / NUM_BUCKETS,
    height: (bounds.top - bounds.bottom) / NUM_BUCKETS
  };
}

export function emptyArray(list: any[]) {
  return list == null || !list.length;
}

export function getZillowNeighborhoods(zillowJson: any): IZillowNeighborhood[] {
  const regionChildren = zillowJson['RegionChildren:regionchildren'];
  if (regionChildren == null) {
    return [];
  }

  const zillowResponse = regionChildren.response;
  if (emptyArray(zillowResponse)) {
    return [];
  }

  const zillowResponseList = zillowResponse[0].list;
  if (emptyArray(zillowResponseList)) {
    return [];
  }

  const zillowRegions = zillowResponseList[0].region;
  if (emptyArray(zillowRegions)) {
    return [];
  }

  const zillowNeighborhoods: IZillowNeighborhood[] = [];
  for (const region of zillowRegions) {
    const zIndex = region.zindex;
    if (zIndex === undefined) {
      continue;
    }

    zillowNeighborhoods.push({
      name: region.name[0],
      zindex: parseInt(zIndex[0]._, 10),
      lat: parseFloat(region.latitude[0]),
      lng: parseFloat(region.longitude[0])
    });
  }
  return zillowNeighborhoods;
}

export function zillowRequestSucceeded(zillowSearchResult: any): boolean {
  const zillowMessageList = zillowSearchResult.message;
  if (emptyArray(zillowMessageList)) {
    return false;
  }

  const zillowCodeList = zillowMessageList[0].code;
  if (emptyArray(zillowCodeList)) {
    return false;
  }

  const zillowCode = zillowCodeList[0];
  if (zillowCode == null) {
    return false;
  }

  return zillowCode === '0';
}

export function getZestimateValue(zillowJson: any): string {
  const INVALID_ZESTIMATE = 'N/A';

  const zillowSearchResult = zillowJson['SearchResults:searchresults'];
  if (zillowSearchResult == null) {
    return INVALID_ZESTIMATE;
  }

  if (!zillowRequestSucceeded(zillowSearchResult)) {
    return INVALID_ZESTIMATE;
  }

  const zillowResponseList = zillowSearchResult.response;
  if (emptyArray(zillowResponseList)) {
    return INVALID_ZESTIMATE;
  }

  const zillowResultsList = zillowResponseList[0].results;
  if (emptyArray(zillowResultsList)) {
    return INVALID_ZESTIMATE;
  }

  const zillowResultList = zillowResultsList[0].result;
  if (emptyArray(zillowResultList)) {
    return INVALID_ZESTIMATE;
  }

  const zillowZestimateList = zillowResultList[0].zestimate;
  if (emptyArray(zillowZestimateList)) {
    return INVALID_ZESTIMATE;
  }

  const zillowAmountList = zillowZestimateList[0].amount;
  if (emptyArray(zillowAmountList)) {
    return INVALID_ZESTIMATE;
  }

  const zestimateAmount = zillowAmountList[0]._;
  if (zestimateAmount == null) {
    return INVALID_ZESTIMATE;
  }

  return `$${parseInt(zestimateAmount, 10).toLocaleString()}`;
}

export function getTrafficLevelFromAverageVolume(averageVolume: number): string {
  if (averageVolume < 1000) {
    return 'Low';
  }

  if (averageVolume < 5000) {
    return 'Medium';
  }

  return 'High';
}
