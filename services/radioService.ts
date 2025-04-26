import { RadioBrowserApi, StationSearchType } from "radio-browser-api";

// Function to get a random HTTPS server
async function getRandomServer() {
  try {
    const response = await fetch(
      "https://all.api.radio-browser.info/json/servers"
    );
    const servers = await response.json();
    // Filter for HTTPS servers and get their names
    const httpsServers = servers
      .filter((server: any) => server.hasOwnProperty("name"))
      .map((server: any) => `https://${server.name}`);

    if (httpsServers.length === 0) {
      // Fallback to known HTTPS servers if discovery fails
      return "https://de1.api.radio-browser.info";
    }

    // Return a random server from the list
    return httpsServers[Math.floor(Math.random() * httpsServers.length)];
  } catch (error) {
    console.warn("Failed to fetch radio servers, using fallback:", error);
    // Fallback to a known HTTPS server
    return "https://de1.api.radio-browser.info";
  }
}

// Function to ensure URLs are HTTPS
function ensureHttps(url: string): string {
  if (!url) return url;
  // If it's a protocol-relative URL, prepend HTTPS
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  // If it's an HTTP URL, convert to HTTPS
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
}

// Function to ensure all station URLs are HTTPS
function sanitizeStation(station: any) {
  return {
    ...station,
    url: ensureHttps(station.url),
    urlResolved: ensureHttps(station.urlResolved),
    homepage: ensureHttps(station.homepage),
    favicon: ensureHttps(station.favicon),
  };
}

// Create API instance with custom configuration
const createApi = async () => {
  const api = new RadioBrowserApi("RadioMap - Next.js Application");
  const baseUrl = await getRandomServer();
  // @ts-ignore - setBaseUrl exists but TypeScript definitions are outdated
  api.setBaseUrl(baseUrl);
  return api;
};

// Initialize API instance
let api: RadioBrowserApi | null = null;

// Get or create API instance
const getApi = async () => {
  if (!api) {
    api = await createApi();
  }
  return api;
};

export interface StationQueryParams {
  limit?: number;
  offset?: number;
  countryCode?: string;
  language?: string;
  tag?: string;
  tagList?: string[];
  hasGeoInfo?: boolean;
}

// Fetch stations from different regions to ensure global distribution
export const fetchGlobalStations = async (limit = 1000) => {
  try {
    const radioApi = await getApi();
    // Define regions with country codes to ensure better global distribution
    const regions = {
      northAmerica: ["US", "CA", "MX"],
      southAmerica: ["BR", "AR", "CO", "CL", "PE", "VE", "EC"],
      europe: [
        "GB",
        "DE",
        "FR",
        "IT",
        "ES",
        "NL",
        "PL",
        "SE",
        "NO",
        "FI",
        "DK",
        "PT",
        "CH",
        "AT",
        "BE",
        "IE",
        "GR",
      ],
      africa: [
        "ZA",
        "EG",
        "MA",
        "NG",
        "KE",
        "GH",
        "TZ",
        "DZ",
        "TN",
        "UG",
        "SN",
      ],
      asia: [
        "JP",
        "CN",
        "IN",
        "KR",
        "ID",
        "PH",
        "MY",
        "SG",
        "TH",
        "VN",
        "TR",
        "IL",
        "AE",
        "SA",
        "PK",
      ],
      oceania: ["AU", "NZ", "FJ", "PG"],
      other: ["Other"],
    };

    // Fetch stations from each region separately to ensure diversity
    const fetchByRegion = async (
      countryCodes: string[],
      perCountryLimit = 20
    ) => {
      const results = [];
      for (const code of countryCodes) {
        try {
          const stationsForCountry = await radioApi.searchStations({
            countryCode: code,
            limit: perCountryLimit,
            hasGeoInfo: true,
          });

          // Filter for valid geo coordinates and sanitize URLs
          const validStations = stationsForCountry
            .filter(
              (station) =>
                station.geoLat &&
                station.geoLong &&
                !isNaN(parseFloat(String(station.geoLat))) &&
                !isNaN(parseFloat(String(station.geoLong)))
            )
            .map(sanitizeStation);

          results.push(...validStations);
        } catch (error) {
          console.warn(`Failed to fetch stations for country ${code}:`, error);
          // Continue with other countries even if one fails
        }
      }
      return results;
    };

    // Fetch stations from each region with increased limits
    const [
      northAmericanStations,
      southAmericanStations,
      europeanStations,
      africanStations,
      asianStations,
      oceaniaStations,
      otherStations,
    ] = await Promise.all([
      fetchByRegion(regions.northAmerica, 100),
      fetchByRegion(regions.southAmerica, 80),
      fetchByRegion(regions.europe, 50),
      fetchByRegion(regions.africa, 80),
      fetchByRegion(regions.asia, 60),
      fetchByRegion(regions.oceania, 100),
      fetchByRegion(regions.other, 70),
    ]);

    // Also fetch some global popular stations to supplement
    const popularStations = await radioApi.getStationsByVotes({
      limit: 200,
      offset: 0,
    });

    // Filter popular stations that have valid geo info and sanitize URLs
    const validPopularStations = popularStations
      .filter(
        (station) =>
          station.geoLat &&
          station.geoLong &&
          !isNaN(parseFloat(String(station.geoLat))) &&
          !isNaN(parseFloat(String(station.geoLong)))
      )
      .map(sanitizeStation);

    // Combine all stations and log distribution
    const allStations = [
      ...northAmericanStations,
      ...southAmericanStations,
      ...europeanStations,
      ...africanStations,
      ...asianStations,
      ...oceaniaStations,
      ...otherStations,
      ...validPopularStations,
    ];

    // Log station counts by region
    console.log("Stations fetched by region:", {
      north_america: northAmericanStations.length,
      south_america: southAmericanStations.length,
      europe: europeanStations.length,
      africa: africanStations.length,
      asia: asianStations.length,
      oceania: oceaniaStations.length,
      other: otherStations.length,
      total: allStations.length,
    });

    return allStations;
  } catch (error) {
    console.error("Failed to fetch global stations:", error);
    throw error;
  }
};

export const fetchStations = async (params: StationQueryParams = {}) => {
  try {
    const radioApi = await getApi();

    // If we specifically want global distribution, use our custom function
    if (params.hasGeoInfo) {
      return fetchGlobalStations(params.limit || 2000);
    }

    const stations = await radioApi.searchStations({
      ...params,
      hasGeoInfo: params.hasGeoInfo !== undefined ? params.hasGeoInfo : true,
      limit: params.limit || 2000,
    });

    return stations
      .filter(
        (station) =>
          station.geoLat &&
          station.geoLong &&
          !isNaN(parseFloat(String(station.geoLat))) &&
          !isNaN(parseFloat(String(station.geoLong)))
      )
      .map(sanitizeStation);
  } catch (error) {
    console.error("Failed to fetch stations:", error);
    throw error;
  }
};

export const fetchPopularStations = async (limit = 100) => {
  try {
    const radioApi = await getApi();
    const stations = await radioApi.getStationsByVotes({ limit, offset: 0 });
    return stations.map(sanitizeStation);
  } catch (error) {
    console.error("Failed to fetch popular stations:", error);
    throw error;
  }
};

export const fetchStationsByCountry = async (
  countryCode: string,
  limit = 100
) => {
  try {
    const radioApi = await getApi();
    const stations = await radioApi.searchStations({
      countryCode,
      limit,
    });
    return stations.map(sanitizeStation);
  } catch (error) {
    console.error(
      `Failed to fetch stations for country ${countryCode}:`,
      error
    );
    throw error;
  }
};

export const fetchStationsByTag = async (tag: string, limit = 100) => {
  try {
    const radioApi = await getApi();
    const stations = await radioApi.getStationsBy(
      StationSearchType.byTag,
      tag,
      {
        limit,
        offset: 0,
      }
    );
    return stations.map(sanitizeStation);
  } catch (error) {
    console.error(`Failed to fetch stations with tag ${tag}:`, error);
    throw error;
  }
};

export const fetchCountries = async () => {
  try {
    const radioApi = await getApi();
    const countries = await radioApi.countryList();
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    throw error;
  }
};

export const fetchTags = async (limit = 100) => {
  try {
    const radioApi = await getApi();
    const tags = await radioApi.tagList({ limit, offset: 0 });
    return tags.sort((a, b) => b.stationcount - a.stationcount);
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    throw error;
  }
};

export const loadStationsFromLocalFile = async (limit = 4000) => {
  try {
    const stationsModule = await import("@/data/radio_stations.json")
      .then((module) => module.default || module)
      .catch((error) => {
        console.error("Failed to import local stations file:", error);
        throw new Error("Local station data not available");
      });

    const stations = Array.isArray(stationsModule) ? stationsModule : [];

    // Use the actual data structure from the JSON file
    const validStations = stations
      .filter((station) => {
        // Make sure this is a valid station with basic required properties
        return (
          station && typeof station === "object" && station.name && station.url
        );
      })
      .map((station) => {
        // Transform stations if needed to match expected format
        // Ensure URLs are HTTPS
        const sanitizedStation = {
          ...station,
          url: ensureHttps(station.url),
          url_resolved: station.url_resolved
            ? ensureHttps(station.url_resolved)
            : ensureHttps(station.url),
          homepage: station.homepage ? ensureHttps(station.homepage) : "",
          favicon: station.favicon ? ensureHttps(station.favicon) : "",
        };
        return sanitizedStation;
      })
      .slice(0, limit);

    console.log(
      `Found ${validStations.length} valid stations out of ${stations.length} total`
    );
    return validStations;
  } catch (error) {
    console.error("Failed to load stations from local file:", error);
    throw error;
  }
};
