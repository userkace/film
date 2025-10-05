import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Region =
  | "dallas"
  | "portland"
  | "new-york"
  | "paris"
  | "hong-kong"
  | "kansas"
  | "sydney"
  | "singapore"
  | "mumbai"
  | "unknown";

interface RegionStore {
  region: Region | null;
  lastChecked: number | null;
  userPicked: boolean;
  setRegion: (region: Region, userPicked?: boolean) => void;
}

export const useRegionStore = create<RegionStore>()(
  persist(
    (set) => ({
      region: null,
      lastChecked: null,
      userPicked: false,
      setRegion: (region, userPicked = false) => {
        set({
          region,
          lastChecked: Math.floor(Date.now() / 1000),
          userPicked,
        });
      },
    }),
    {
      name: "__MW::region",
      version: 8,
    },
  ),
);

// Coordinates for each proxy server region
const regionCoordinates = [
  { region: "dallas" as Region, lat: 32.7767, lon: -96.797 }, // Dallas, TX, US
  { region: "portland" as Region, lat: 45.5152, lon: -122.6784 }, // Portland, OR, US
  { region: "new-york" as Region, lat: 40.7128, lon: -74.006 }, // New York, NY, US
  { region: "paris" as Region, lat: 48.8566, lon: 2.3522 }, // Paris, France
  { region: "hong-kong" as Region, lat: 22.3193, lon: 114.1694 }, // Hong Kong
  { region: "kansas" as Region, lat: 39.0997, lon: -94.5786 }, // Kansas City, MO, US
  { region: "sydney" as Region, lat: -33.8688, lon: 151.2093 }, // Sydney, Australia
  { region: "singapore" as Region, lat: 1.3521, lon: 103.8198 }, // Singapore
  { region: "mumbai" as Region, lat: 19.076, lon: 72.8777 }, // Mumbai, India
];

// Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function determineRegion(data: {
  latitude: number;
  longitude: number;
}): Region {
  const { latitude, longitude } = data;

  let closestRegion: Region = "unknown";
  let minDistance = Infinity;

  for (const { region, lat, lon } of regionCoordinates) {
    const distance = calculateDistance(latitude, longitude, lat, lon);
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  }

  return closestRegion;
}

// 1. Check if user manually picked a region (highest priority)
// 2. Check if we need to refresh the region
// 3. If refresh needed, fall back to IP detection
// 4. If no refresh needed, use existing region

export async function detectRegion(): Promise<Region> {
  const store = useRegionStore.getState();

  // If user picked a region, always return that
  if (store.userPicked && store.region) {
    return store.region;
  }

  // Check if we need to refresh the region
  const needsRefresh =
    !store.region ||
    !store.lastChecked ||
    Math.floor(Date.now() / 1000) - store.lastChecked >= 2592000; // 30 days in seconds

  if (!needsRefresh && store.region) {
    return store.region;
  }

  try {
    // Fallback to IP-based detection
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (
      typeof data.latitude !== "number" ||
      typeof data.longitude !== "number"
    ) {
      const backupResponse = await fetch("https://ipinfo.io/json");
      const backupData = await backupResponse.json();

      if (backupData.loc) {
        const [latitude, longitude] = backupData.loc.split(",").map(Number);
        const detectedRegion = determineRegion({
          latitude,
          longitude,
        });
        if (!store.userPicked) {
          store.setRegion(detectedRegion);
        }
        return detectedRegion;
      }

      return "unknown";
    }

    const detectedRegion = determineRegion(data);
    if (!store.userPicked) {
      store.setRegion(detectedRegion);
    }
    return detectedRegion;
  } catch (error) {
    console.warn("Failed to detect region:", error);
    return store.region || "unknown";
  }
}
