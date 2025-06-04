import { useState, useEffect, useRef } from "react";
import { useRadioStore } from "@/store/radioStore";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { StationImage } from "./StationImage";

const PlayerControls = () => {
  const {
    selectedStation,
    isPlaying,
    volume,
    togglePlayback,
    setVolume,
    errorMessage,
    audioElement,
  } = useRadioStore();
  const [expanded, setExpanded] = useState(true);
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);
  const volumeControlsRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);

  // Close volume control when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeControlsRef.current &&
        volumeButtonRef.current &&
        !volumeControlsRef.current.contains(event.target as Node) &&
        !volumeButtonRef.current.contains(event.target as Node)
      ) {
        setShowVolumeControls(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync local volume with global volume
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalVolume(volume);
    }
  }, [volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);

    // Directly update audio element volume for immediate feedback
    if (audioElement) {
      audioElement.volume = newVolume;
    }
  };

  const handleVolumeDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleVolumeDragEnd = () => {
    isDraggingRef.current = false;
    // Update store only when drag ends
    setVolume(localVolume);
  };

  // Auto-expand when a station is selected
  useEffect(() => {
    if (selectedStation) {
      setExpanded(true);
    }
  }, [selectedStation]);

  // Handle loading state when toggling playback
  useEffect(() => {
    if (selectedStation && !isPlaying && !errorMessage) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000); // Maximum loading time of 3 seconds
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [selectedStation, isPlaying, errorMessage]);

  if (!selectedStation) {
    return null;
  }

  // Make sure we have the station favicon
  const stationFavicon = selectedStation?.favicon || "";
  const stationName = selectedStation?.name || "Unknown Station";
  const stationCountry = selectedStation?.country || "";

  const handleCollapsedPlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlayback();
  };

  const handleContainerClick = () => {
    setExpanded(true);
  };

  return (
    <div className="transition-all duration-300 max-w-sm sm:max-w-md lg:max-w-lg  w-full px-2  ">
      {expanded ? (
        <div className=" backdrop-blur-md text-white rounded-xl  shadow-xl">
          <div className="flex items-center justify-between p-5">
            <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center min-w-0 flex-1">
              {stationFavicon ? (
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <StationImage
                    src={stationFavicon}
                    alt={stationName}
                    width={48}
                    height={48}
                    className="rounded-lg w-full h-full object-cover"
                    key={`player-${
                      selectedStation.id || selectedStation.stationuuid
                    }`}
                  />
                  {errorMessage && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                  )}
                  {isLoading && !errorMessage && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  {errorMessage ? (
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                  ) : isLoading ? (
                    <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-gray-400"
                    >
                      <path d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  )}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-base truncate">{stationName}</h3>
                {errorMessage ? (
                  <p className="text-xs text-yellow-400 truncate mt-1">
                    {errorMessage}
                  </p>
                ) : isLoading ? (
                  <p className="text-xs text-blue-400 truncate mt-1">
                    Loading station...
                  </p>
                ) : (
                  <p className="text-xs text-gray-200 truncate opacity-80 mt-1">
                    {stationCountry}
                    {selectedStation.tags
                      ? typeof selectedStation.tags === "string"
                        ? selectedStation.tags
                          ? ` • ${selectedStation.tags}`
                          : ""
                        : Array.isArray(selectedStation.tags) &&
                          selectedStation.tags.length > 0
                        ? ` • ${selectedStation.tags.slice(0, 2).join(", ")}`
                        : ""
                      : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-5">
              <button
                onClick={togglePlayback}
                className={`p-3 rounded-full ${
                  isPlaying
                    ? "bg-white text-blue-700"
                    : "bg-blue-500 text-white"
                } hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center ${
                  errorMessage ? "opacity-80" : ""
                }`}
                aria-label={isPlaying ? "Pause" : "Play"}
                style={{ width: "44px", height: "44px" }}
              >
                {isLoading && !isPlaying && !errorMessage ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5 ml-0.5" />
                )}
              </button>

              <div className="relative hidden sm:block">
                <button
                  ref={volumeButtonRef}
                  onClick={() => setShowVolumeControls(!showVolumeControls)}
                  className="p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-indigo-800/50"
                  aria-label="Volume"
                >
                  {localVolume === 0 ? (
                    <SpeakerXMarkIcon className="h-5 w-5" />
                  ) : (
                    <SpeakerWaveIcon className="h-5 w-5" />
                  )}
                </button>

                {showVolumeControls && (
                  <div
                    ref={volumeControlsRef}
                    className="absolute bottom-full right-0 mb-2 p-3 bg-indigo-950/90 rounded-lg shadow-lg z-10 border border-indigo-700/50 backdrop-blur-md"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={localVolume}
                      onChange={handleVolumeChange}
                      onMouseDown={handleVolumeDragStart}
                      onTouchStart={handleVolumeDragStart}
                      onMouseUp={handleVolumeDragEnd}
                      onTouchEnd={handleVolumeDragEnd}
                      className="w-24 accent-blue-500"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => setExpanded(false)}
                className="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-indigo-800/50"
                aria-label="Minimize player"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleContainerClick}
          className="flex items-center space-x-3 bg-gradient-to-r from-indigo-900/90 to-blue-900/90 backdrop-blur-md text-white rounded-full py-3 px-5 shadow-xl mx-6 mt-4 hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-indigo-700/50"
        >
          <div className="flex items-center">
            {isPlaying ? (
              <div className="flex items-center gap-3">
                <div
                  className={`bg-white rounded-full p-1.5 flex items-center justify-center ${
                    errorMessage ? "bg-opacity-80" : ""
                  }`}
                  style={{ width: "26px", height: "26px" }}
                  onClick={handleCollapsedPlayClick}
                >
                  {errorMessage ? (
                    <ExclamationTriangleIcon className="h-3.5 w-3.5 text-yellow-500" />
                  ) : isLoading ? (
                    <div className="h-3.5 w-3.5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PauseIcon className="h-3.5 w-3.5 text-blue-700" />
                  )}
                </div>
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {stationName}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className={`bg-blue-500 rounded-full p-1.5 flex items-center justify-center ${
                    errorMessage ? "bg-opacity-80" : ""
                  }`}
                  style={{ width: "26px", height: "26px" }}
                  onClick={handleCollapsedPlayClick}
                >
                  {errorMessage ? (
                    <ExclamationTriangleIcon className="h-3.5 w-3.5 text-yellow-300" />
                  ) : isLoading ? (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PlayIcon className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {stationName}
                </span>
              </div>
            )}
          </div>
          <ArrowUpIcon className="h-3 w-3 opacity-70" />
        </button>
      )}
    </div>
  );
};

export default PlayerControls;
