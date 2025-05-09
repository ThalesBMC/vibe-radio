import { useQuery } from "@tanstack/react-query";
import {
  fetchStations,
  fetchPopularStations,
  fetchStationsByCountry,
  fetchStationsByTag,
  fetchCountries,
  fetchTags,
  StationQueryParams,
  loadStationsFromLocalFile,
} from "@/services/radioService";

export const useStations = (params: StationQueryParams = {}) => {
  return useQuery({
    queryKey: ["localStations", params],
    queryFn: () => loadStationsFromLocalFile(params.limit || 4000),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePopularStations = (limit = 100) => {
  return useQuery({
    queryKey: ["popularStations", limit],
    queryFn: () => fetchPopularStations(limit),
  });
};

export const useStationsByCountry = (countryCode: string, limit = 100) => {
  return useQuery({
    queryKey: ["stationsByCountry", countryCode, limit],
    queryFn: () => fetchStationsByCountry(countryCode, limit),
    enabled: !!countryCode,
  });
};

export const useStationsByTag = (tag: string, limit = 100) => {
  return useQuery({
    queryKey: ["stationsByTag", tag, limit],
    queryFn: () => fetchStationsByTag(tag, limit),
    enabled: !!tag,
  });
};

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
  });
};

export const useTags = (limit = 100) => {
  return useQuery({
    queryKey: ["tags", limit],
    queryFn: () => fetchTags(limit),
  });
};
