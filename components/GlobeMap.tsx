"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Station } from "radio-browser-api";
import { useRadioStore } from "@/store/radioStore";

// Extended station type to support both API and local JSON formats
interface ExtendedStation extends Omit<Station, "tags"> {
  geo_lat?: number;
  geo_long?: number;
  stationuuid?: string;
  tags?: string | string[];
}

// Nebula component for a cosmic cloud effect
const Nebula = () => {
  const nebulaMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const time = useRef(0);

  // Custom shader for a nebula-like effect
  const nebulaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color("#1e0f5c") },
        color2: { value: new THREE.Color("#5c2e78") },
        color3: { value: new THREE.Color("#a072be") },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Simplex noise function from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          // Multiple noise layers with different scales and speeds
          float noise1 = snoise(vUv * 3.0 + time * 0.05) * 0.5 + 0.5;
          float noise2 = snoise(vUv * 5.0 - time * 0.07) * 0.5 + 0.5;
          float noise3 = snoise(vUv * 7.0 + time * 0.03) * 0.5 + 0.5;
          
          // Distance from center for radial falloff
          float dist = length(vPosition.xy) / 20.0;
          float alpha = smoothstep(1.0, 0.0, dist) * 0.6;
          
          // Mix colors based on noise
          vec3 color = mix(color1, color2, noise1);
          color = mix(color, color3, noise2 * noise3);
          
          gl_FragColor = vec4(color, alpha * (noise1 * 0.7 + 0.3));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    time.current = clock.getElapsedTime();
    if (nebulaMaterialRef.current) {
      nebulaMaterialRef.current.uniforms.time.value = time.current;
    }
  });

  return (
    <mesh position={[0, 0, -30]} rotation={[0.1, 0.2, 0.3]}>
      <planeGeometry args={[60, 60, 1, 1]} />
      <primitive object={nebulaMaterial} ref={nebulaMaterialRef} />
    </mesh>
  );
};

// Enhanced background with nebula and stars
const EnhancedStarField = () => {
  const { scene } = useThree();
  const starsRef = useRef<THREE.Group>(null);

  // Slowly rotate the entire starfield
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001;
    }
  });

  useEffect(() => {
    return () => {
      // Clean up particles when component unmounts
      scene.traverse((object) => {
        if (object instanceof THREE.Points || object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [scene]);

  return (
    <group ref={starsRef}>
      {/* First layer of stars */}
      <Nebula />

      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Second layer of stars with different parameters */}
      <Stars
        radius={120}
        depth={70}
        count={2000}
        factor={6}
        saturation={0.2}
        fade
        speed={0.3}
      />

      {/* Nebula effect in the background */}
      <Nebula />

      {/* Sparkles for bright stars effect */}
      <Sparkles
        count={150}
        scale={100}
        size={4}
        speed={0.1}
        opacity={0.8}
        color="#ffffff"
        noise={0.1}
      />

      {/* Distant colored sparkles for galactic effect */}
      <Sparkles
        count={50}
        scale={120}
        size={6}
        speed={0.05}
        opacity={0.5}
        color="#a38fff"
        noise={0.2}
      />
    </group>
  );
};

// Simple Station Marker
const StationMarker = ({
  position,
  isActive,
  onClick,
}: {
  position: [number, number, number];
  isActive: boolean;
  onClick: () => void;
}) => {
  const color = isActive ? "#f97316" : "#3b82f6";
  const scale = isActive ? 1.3 : 1;

  return (
    <mesh
      position={position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <sphereGeometry args={[0.01, 6, 6]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Helper function to determine which continent a coordinate belongs to (approximate)
const getContinentFromCoords = (lat: number, lng: number): string => {
  // Very simplified continent detection based on lat/long ranges
  // North America
  if (lat >= 15 && lat <= 90 && lng >= -170 && lng <= -30) {
    return "north_america";
  }
  // South America
  if (lat >= -60 && lat <= 15 && lng >= -90 && lng <= -30) {
    return "south_america";
  }
  // Europe
  if (lat >= 35 && lat <= 75 && lng >= -10 && lng <= 40) {
    return "europe";
  }
  // Africa
  if (lat >= -40 && lat <= 35 && lng >= -20 && lng <= 55) {
    return "africa";
  }
  // Asia
  if (lat >= 0 && lat <= 75 && lng >= 40 && lng <= 180) {
    return "asia";
  }
  // Australia & Oceania
  if (lat >= -50 && lat <= 0 && lng >= 110 && lng <= 180) {
    return "oceania";
  }
  // Default case
  return "other";
};

// Earth component with continuous rotation and stations
const Earth = ({ stations }: { stations: ExtendedStation[] }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const globeGroupRef = useRef<THREE.Group>(null);
  const { gl, scene } = useThree();
  const { selectedStation, playStation, setCurrentPosition } = useRadioStore();

  // Filter stations with valid coordinates and distribute across continents
  const validStations = useMemo(() => {
    // First, get all stations with valid coordinates
    const stationsWithCoords = stations.filter(
      (station) =>
        station &&
        // Check for geo_lat/geo_long (local JSON format)
        ((typeof station.geo_lat === "number" &&
          !isNaN(station.geo_lat) &&
          typeof station.geo_long === "number" &&
          !isNaN(station.geo_long)) ||
          // Check for geoLat/geoLong (API format)
          (station.geoLat &&
            station.geoLong &&
            !isNaN(parseFloat(String(station.geoLat))) &&
            !isNaN(parseFloat(String(station.geoLong)))))
    );

    // Group stations by continent
    const continentGroups: { [key: string]: ExtendedStation[] } = {
      north_america: [],
      south_america: [],
      europe: [],
      africa: [],
      asia: [],
      oceania: [],
      other: [],
    };

    // Sort stations into continent groups
    stationsWithCoords.forEach((station) => {
      try {
        // Get coordinates depending on which format the station uses
        const lat =
          typeof station.geo_lat === "number"
            ? station.geo_lat
            : station.geoLat
            ? parseFloat(String(station.geoLat))
            : 0;
        const lng =
          typeof station.geo_long === "number"
            ? station.geo_long
            : station.geoLong
            ? parseFloat(String(station.geoLong))
            : 0;

        if (lat === 0 && lng === 0) {
          // Skip stations with 0,0 coordinates (likely invalid)
          return;
        }

        const continent = getContinentFromCoords(lat, lng);
        continentGroups[continent].push(station);
      } catch (error) {
        // Skip stations with invalid coordinates
        console.error("Error processing station:", error);
      }
    });

    // Use all stations from each continent
    const allStations: ExtendedStation[] =
      Object.values(continentGroups).flat();

    return allStations;
  }, [stations]);

  // Load textures with optimization
  const textures = useTexture({
    earthTexture: "/earth-texture.jpg",
    cloudsTexture: "/clouds-texture.png",
  });

  // Use useFrame for guaranteed continuous animation
  useFrame(() => {
    if (globeGroupRef.current) {
      // Rotate the entire group (earth, clouds, and markers together)
      globeGroupRef.current.rotation.y += 0.0005;

      // Individual cloud rotation (slightly faster than earth)
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.0001;
      }
    }
  });

  // Cleanup resources on unmount
  useEffect(() => {
    return () => {
      // Cleanup resources
      Object.values(textures).forEach((texture) => {
        if (texture) {
          texture.dispose();
        }
      });

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      gl.dispose();
    };
  }, [gl, scene, textures]);

  // Don't render until textures are loaded
  if (!textures.earthTexture || !textures.cloudsTexture) return null;

  return (
    <group ref={globeGroupRef}>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          map={textures.earthTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.01, 24, 24]} />
        <meshStandardMaterial
          map={textures.cloudsTexture}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.02, 16, 16]} />
        <meshStandardMaterial
          color="#4060ff"
          transparent={true}
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Station markers - INSIDE the globe group to rotate with it */}
      {validStations.map((station) => {
        try {
          // Get coordinates safely based on available properties
          const lat =
            typeof station.geo_lat === "number"
              ? station.geo_lat
              : parseFloat(String(station.geoLat || 0));
          const lng =
            typeof station.geo_long === "number"
              ? station.geo_long
              : parseFloat(String(station.geoLong || 0));

          // Skip stations with 0,0 coordinates
          if (lat === 0 && lng === 0) {
            return null;
          }

          const position = latLngToPosition(lat, lng);

          // Generate a unique ID if the station doesn't have one
          const stationId =
            station.id || station.stationuuid || `station-${lat}-${lng}`;

          const isActive =
            selectedStation?.id === stationId ||
            selectedStation?.stationuuid === station.stationuuid;

          return (
            <StationMarker
              key={stationId}
              position={position}
              isActive={isActive}
              onClick={() => {
                // Ensure station has an id property before passing to playStation
                const stationWithId = {
                  ...station,
                  id: stationId,
                };
                playStation(stationWithId);
                setCurrentPosition([lat, lng]);
              }}
            />
          );
        } catch (error) {
          console.error("Error rendering station marker:", error);
          // Skip invalid stations
          return null;
        }
      })}
    </group>
  );
};

// Convert lat/long to 3D coordinates
const latLngToPosition = (
  lat: number,
  lng: number,
  radius: number = 1
): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
};

// Main Scene with memory and performance optimizations
const Scene = ({ stations }: { stations: ExtendedStation[] }) => {
  return (
    <>
      {/* Enhanced background */}
      <EnhancedStarField />

      {/* Reduced lighting intensity */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={0.7} />

      {/* Controls with optimized parameters */}
      <OrbitControls
        enableDamping={false}
        rotateSpeed={0.2}
        minDistance={1.5}
        maxDistance={4}
        enableZoom={true}
        enablePan={false}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI - 0.1}
        enableRotate={true}
        autoRotate={false}
      />

      {/* Earth with natural tilt */}
      <group rotation={[(Math.PI * 23.5) / 180, 0, 0]}>
        <Earth stations={stations} />
      </group>
    </>
  );
};

// Main GlobeMap component with context recovery
interface GlobeMapProps {
  stations: ExtendedStation[];
}

const GlobeMap: React.FC<GlobeMapProps> = ({ stations }) => {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Ensure proper initialization
  useEffect(() => {
    const initTimeout = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      setMounted(false);
    };
  }, []);

  // Context loss recovery with debounce
  useEffect(() => {
    let recoveryTimeout: NodeJS.Timeout;
    let isRecovering = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (isRecovering) return;

      isRecovering = true;
      retryCount++;

      setHasError(true);

      if (retryCount <= MAX_RETRIES) {
        clearTimeout(recoveryTimeout);
        recoveryTimeout = setTimeout(() => {
          setKey((prev) => prev + 1);
          setHasError(false);
          isRecovering = false;
        }, 2000 * retryCount);
      } else {
        console.error("Max WebGL context recovery attempts reached");
      }
    };

    const handleContextRestored = () => {
      setHasError(false);
      isRecovering = false;
      retryCount = 0;
    };

    if (mounted) {
      window.addEventListener("webglcontextlost", handleContextLost, false);
      window.addEventListener(
        "webglcontextrestored",
        handleContextRestored,
        false
      );
    }

    return () => {
      window.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("webglcontextrestored", handleContextRestored);
      clearTimeout(recoveryTimeout);
    };
  }, [mounted]);

  // Don't render until properly initialized
  if (!mounted) return null;

  if (hasError) {
    return (
      <div className="globe-container bg-gradient-to-b from-black to-[#050a30] flex items-center justify-center">
        <div className="text-white text-center p-5">
          <h3 className="text-xl mb-2">Reloading 3D Globe</h3>
          <p className="mb-4">Please wait a moment...</p>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="globe-container">
      <Canvas
        key={key}
        ref={canvasRef}
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{
          background: "linear-gradient(to bottom, #000000, #050a30)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        frameloop="always" // Ensure continuous rendering
        gl={{
          antialias: false,
          powerPreference: "low-power",
          alpha: false,
          stencil: false,
          depth: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: true,
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

          const maxDimension = 1536;
          const canvas = gl.domElement;
          const width = Math.min(canvas.width, maxDimension);
          const height = Math.min(canvas.height, maxDimension);
          gl.setSize(width, height, false);
        }}
      >
        <Scene stations={stations} />
      </Canvas>
    </div>
  );
};

export default GlobeMap;
