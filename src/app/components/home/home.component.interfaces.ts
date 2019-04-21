export interface ILocation {
  readonly lat: number;
  readonly lng: number;
}

export interface IAddress extends ILocation {
  readonly address: string;
  readonly zip: number;
}

export interface ITrafficData extends ILocation {
  readonly date: number;
  readonly volume: number;
  readonly level: string;
}

export interface ITspProject extends ILocation {
  readonly name: string;
  readonly description: string;
}

export interface IZillowNeighborhood extends ILocation {
  readonly name: string;
  readonly zindex: number;
}

export interface IBucket {
  sum: number;
  count: number;
}

export interface IBucketSize {
  readonly width: number;
  readonly height: number;
}

export interface IBounds {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}
