export interface IDensityInfo {
  readonly min: number;
  readonly max: number;
}

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
