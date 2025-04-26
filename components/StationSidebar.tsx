import React, { useState, useEffect, useRef } from "react";
import { Station } from "radio-browser-api";
import { useRadioStore } from "@/store/radioStore";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  RadioIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import { StationImage } from "./StationImage";

interface StationSidebarProps {
  stations: Station[];
  isLoading: boolean;
}

const StationSidebar: React.FC<StationSidebarProps> = ({
  stations,
  isLoading,
}) => {
  const { selectedStation, playStation } = useRadioStore();
  const [collapsed, setCollapsed] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStations(stations);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStations(
        stations.filter(
          (station) =>
            station.name.toLowerCase().includes(term) ||
            (station.country && station.country.toLowerCase().includes(term)) ||
            (station.tags &&
              station.tags.some((tag) => tag.toLowerCase().includes(term)))
        )
      );
    }
  }, [stations, searchTerm]);

  const handleStationClick = (station: Station) => {
    playStation(station);

    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  };

  const handleSearchFocus = () => {
    if (collapsed) {
      setCollapsed(false);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  };

  return (
    <div
      className={`h-screen fixed top-0 left-0 transition-all duration-300 z-50 ${
        collapsed ? "w-16" : "w-72 md:w-88"
      }`}
    >
      <div
        className={`h-full bg-gradient-to-b from-indigo-900 to-blue-900 text-white shadow-xl relative ${
          collapsed ? "" : "rounded-r-xl overflow-hidden"
        }`}
      >
        {/* Toggle button */}
        <button
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 z-20 shadow-lg transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>

        {/* Mini view when collapsed */}
        {collapsed && (
          <div className="h-full flex flex-col items-center py-6 space-y-6">
            {/* Search button in collapsed mode */}
            <button
              onClick={handleSearchFocus}
              className="p-2 rounded-full bg-indigo-800 hover:bg-indigo-700 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Globe icon */}
            <div className="flex-1 flex items-center justify-center">
              <GlobeAltIcon className="h-8 w-8 text-blue-400 opacity-70" />
            </div>

            {/* Currently playing indicator */}
            {selectedStation && (
              <div className="w-8 h-8 mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                {selectedStation.favicon ? (
                  <StationImage
                    src={selectedStation.favicon}
                    alt={selectedStation.name}
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <RadioIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Full sidebar content */}
        {!collapsed && (
          <div className="h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-6">
              <button
                className="text-gray-300 hover:text-white p-1"
                onClick={() => setCollapsed(true)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-300" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 pl-10 pr-10 bg-indigo-950 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setSearchTerm("")}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <p className="text-sm text-blue-200">Loading stations...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto stations-list pr-1">
                {filteredStations.length === 0 ? (
                  <div className="text-center text-gray-300 py-8 px-4">
                    <div className="mb-2">
                      <MagnifyingGlassIcon className="h-8 w-8 mx-auto text-gray-500" />
                    </div>
                    <p>No stations found matching &quot;{searchTerm}&quot;</p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {filteredStations.map((station) => (
                      <li
                        key={station.id}
                        className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                          selectedStation?.id === station.id
                            ? "bg-blue-600 shadow-md"
                            : "hover:bg-indigo-800"
                        }`}
                        onClick={() => handleStationClick(station)}
                      >
                        <div className="flex items-center">
                          {station.favicon ? (
                            <StationImage
                              src={station.favicon}
                              alt={station.name}
                              width={40}
                              height={40}
                              className="rounded-lg"
                              key={`sidebar-${
                                /* eslint-disable  @typescript-eslint/no-explicit-any */
                                station.id || (station as any).stationuuid
                              }`}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <RadioIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">
                              {station.name}
                            </div>
                            <div className="text-xs text-gray-300 truncate">
                              {station.country}
                              {station.tags && station.tags.length > 0
                                ? ` • ${station.tags.slice(0, 1).join(", ")}`
                                : ""}
                            </div>
                          </div>

                          {selectedStation?.id === station.id && (
                            <div className="ml-2 h-2 w-2 rounded-full bg-blue-300 animate-pulse"></div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationSidebar;
