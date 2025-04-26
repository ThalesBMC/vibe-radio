"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStations } from "@/hooks/useRadioApi";
import { useRadioStore, ExtendedStation } from "@/store/radioStore";
import PlayerControls from "@/components/PlayerControls";
import Footer from "@/components/Footer";
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
  // Get stations from API hook
  const { data: stations = [] } = useStations();
  const { setStations } = useRadioStore();

  useEffect(() => {
    if (stations.length > 0) {
      setStations(stations as unknown as ExtendedStation[]);
    }
  }, [stations, setStations]);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Full screen background for the globe */}
      <div className="fixed inset-0 z-0">
        <GlobeMap stations={stations as unknown as ExtendedStation[]} />
      </div>

      {/* Player controls at the bottom */}
      <div className="fixed top-[15px] left-[15px] right-0 z-10 p-4">
        <PlayerControls />
      </div>

      {/* Footer with GitHub and author attribution */}
      <Footer />
    </div>
  );
}
