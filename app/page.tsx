"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useStations } from "@/hooks/useRadioApi";
import { useRadioStore } from "@/store/radioStore";
import PlayerControls from "@/components/PlayerControls";
import "@/styles/mapStyles.css";

// Dynamically import the globe component to prevent SSR issues with Three.js
const GlobeMap = dynamic(() => import("@/components/GlobeMap"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black to-[#050a30]">
      <div className="flex flex-col items-center">
        <p className="text-blue-300 mb-8">Loading 3D World Map...</p>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <div
            className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  const { data: stations = [] } = useStations();
  const { setStations } = useRadioStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Wait for the component to be mounted and allow time for Three.js to initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 2000); // Longer delay to ensure everything is loaded

    return () => clearTimeout(timer);
  }, []);

  // Update the store with stations when loaded
  useEffect(() => {
    if (stations.length > 0) {
      // Use all stations instead of limiting to 50
      setStations(stations);
    }
  }, [stations, setStations]);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Full screen background for the globe */}
      <div className="fixed inset-0 z-0">
        {isInitialized ? (
          <GlobeMap stations={stations} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black to-[#050a30]">
            <div className="flex flex-col items-center">
              <p className="text-blue-300 mb-8">Loading 3D World Map...</p>
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <div
                  className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player controls at the bottom */}
      <div className="fixed top-[15px] left-[15px] right-0 z-10 p-4">
        <PlayerControls />
      </div>
    </div>
  );
}
