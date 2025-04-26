import { create } from "zustand";
import { Station } from "radio-browser-api";

// Extended station type to support both API and local JSON formats
export interface ExtendedStation extends Omit<Station, "tags"> {
  geo_lat?: number;
  geo_long?: number;
  stationuuid?: string;
  tags?: string | string[];
}

interface RadioState {
  selectedStation: ExtendedStation | null;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  volume: number;
  errorMessage: string | null;
  stations: ExtendedStation[];
  stationsLoading: boolean;
  currentPosition: [number, number] | null;

  // Actions
  setSelectedStation: (station: ExtendedStation | null) => void;
  setAudioElement: (element: HTMLAudioElement | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setErrorMessage: (message: string | null) => void;
  setStations: (stations: ExtendedStation[]) => void;
  setStationsLoading: (loading: boolean) => void;
  setCurrentPosition: (position: [number, number] | null) => void;

  // Playback controls
  playStation: (station: ExtendedStation) => void;
  stopPlayback: () => void;
  togglePlayback: () => void;
}

export const useRadioStore = create<RadioState>((set, get) => ({
  selectedStation: null,
  audioElement: typeof window !== "undefined" ? new Audio() : null,
  isPlaying: false,
  volume: 1,
  errorMessage: null,
  stations: [],
  stationsLoading: false,
  currentPosition: null,

  // Setters
  setSelectedStation: (station) => set({ selectedStation: station }),
  setAudioElement: (element) => set({ audioElement: element }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume;
    }
    set({ volume });
  },
  setErrorMessage: (message) => set({ errorMessage: message }),
  setStations: (stations) => set({ stations }),
  setStationsLoading: (loading) => set({ stationsLoading: loading }),
  setCurrentPosition: (position) => set({ currentPosition: position }),

  // Station control methods
  playStation: (station) => {
    const { audioElement, selectedStation } = get();

    if (!audioElement) return;

    // If trying to play the currently selected station
    if (selectedStation && selectedStation.id === station.id) {
      audioElement
        .play()
        .then(() => set({ isPlaying: true, errorMessage: null }))
        .catch((error) => {
          console.error("Error playing station:", error);
          set({
            errorMessage: "Failed to play station. Please try another one.",
          });
        });
      return;
    }

    // If switching to a new station
    set({ selectedStation: station, isPlaying: false, errorMessage: null });

    // Stop current audio
    audioElement.pause();

    // Handle both API and local JSON formats for URL
    const stationUrl = station.urlResolved || station.url;
    audioElement.src = stationUrl;
    audioElement.load();

    // Try to play new station
    audioElement
      .play()
      .then(() => set({ isPlaying: true }))
      .catch((error) => {
        console.error("Error playing station:", error);
        set({
          errorMessage: "Failed to play station. Please try another one.",
        });
      });
  },

  stopPlayback: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      set({ isPlaying: false });
    }
  },

  togglePlayback: () => {
    const { audioElement, isPlaying, selectedStation } = get();

    if (!audioElement || !selectedStation) return;

    if (isPlaying) {
      audioElement.pause();
      set({ isPlaying: false });
    } else {
      audioElement
        .play()
        .then(() => set({ isPlaying: true }))
        .catch((error) => {
          console.error("Error playing station:", error);
          set({
            errorMessage: "Failed to play station. Please try another one.",
          });
        });
    }
  },
}));
