export interface Ship {
  trackId: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  length: number;
  width: number;
  moving: boolean;
  distance?: number;        // Distance depuis la base (en mètres)
  distanceKm?: string;      // Distance formatée "1.23 km"
  heading?: number | null;  // Direction
}

// Ancien format (proxy PHP EuRIS)
export interface ApiResponse {
  tracks: Ship[];
  _metadata: {
    timestamp: string;
    trackCount: number;
  };
}

// Nouveau format (backend Railway /ships)
export interface ShipsResponse {
  success: boolean;
  total: number;
  zones: {
    zone1km: number;
    zone2km: number;
    zone3km: number;
    beyond3km: number;
  };
  ships: Ship[];
}
