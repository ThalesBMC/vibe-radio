declare module "radio-browser-api" {
  export enum StationSearchType {
    byUuid = "byuuid",
    byName = "byname",
    byNameExact = "bynameexact",
    byCodec = "bycodec",
    byCodecExact = "bycodecexact",
    byCountry = "bycountry",
    byCountryExact = "bycountryexact",
    byCountryCodeExact = "bycountrycodeexact",
    byState = "bystate",
    byStateExact = "bystateexact",
    byLanguage = "bylanguage",
    byLanguageExact = "bylanguageexact",
    byTag = "bytag",
    byTagExact = "bytagexact",
  }

  export interface Station {
    id: string;
    changeId: string;
    name: string;
    url: string;
    urlResolved: string;
    homepage: string;
    favicon: string;
    tags: string[];
    country: string;
    countryCode: string;
    state: string;
    language: string[];
    votes: number;
    lastChangeTime: Date;
    codec: string;
    bitrate: number;
    hls: boolean;
    lastCheckOk: boolean;
    lastCheckTime: Date;
    lastCheckOkTime: Date;
    lastLocalCheckTime: Date;
    clickTimestamp: Date;
    clickCount: number;
    clickTrend: number;
    geoLat: number | null;
    geoLong: number | null;
  }

  export interface Country {
    name: string;
    stationcount: number;
  }

  export interface Tag {
    name: string;
    stationcount: number;
  }

  export interface Language {
    name: string;
    stationcount: number;
  }

  export interface QueryParams {
    limit?: number;
    offset?: number;
  }

  export interface StationsQueryParams extends QueryParams {
    countryCode?: string;
    language?: string;
    tag?: string;
    tagList?: string[];
    hasGeoInfo?: boolean;
  }

  export class RadioBrowserApi {
    constructor(userAgent: string);

    searchStations(params: StationsQueryParams): Promise<Station[]>;
    getStationsByVotes(params?: QueryParams): Promise<Station[]>;
    getStationsBy(
      searchType: StationSearchType,
      searchTerm: string,
      params?: QueryParams
    ): Promise<Station[]>;
    countryList(): Promise<Country[]>;
    tagList(params?: QueryParams): Promise<Tag[]>;
    languageList(params?: QueryParams): Promise<Language[]>;
  }
}
