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
}

export interface ApiResponse {
  tracks: Ship[];
  _metadata: {
    timestamp: string;
    trackCount: number;
  };
}
