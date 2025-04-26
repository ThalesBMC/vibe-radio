"use client";

import { useEffect } from "react";

/**
 * This component ensures Leaflet is properly initialized on the client side
 * and fixes common issues with Next.js SSR and Leaflet integration
 */
const MapInitializer = () => {
  useEffect(() => {
    // Fix Leaflet's icon paths when running in a Next.js environment
    if (typeof window !== "undefined") {
      // Dynamically import Leaflet to ensure it's only loaded on the client
      import("leaflet").then((L) => {
        // Fix the paths for the default marker icons
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        delete (L.Icon.Default.prototype as any)._getIconUrl;

        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      });
    }
  }, []);

  return null;
};

export default MapInitializer;
