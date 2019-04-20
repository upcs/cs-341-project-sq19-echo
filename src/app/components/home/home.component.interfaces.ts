export interface IAddress {
  readonly address: string;
  readonly zip: number;
  readonly lat: number;
  readonly lng: number;
}

export interface ITrafficData {
  readonly date: number;
  readonly lat: number;
  readonly lng: number;
  readonly volume: number;
  readonly level: string;
}

export interface ITspProject {
  readonly name: string;
  readonly description: string;
  readonly lat: number;
  readonly lng: number;
}

export interface IBucket {
  sum: number;
  count: number;
}

export interface IZillowNeighborhood {
  readonly name: string;
  readonly zindex: number;
  readonly lat: number;
  readonly lng: number;
}
