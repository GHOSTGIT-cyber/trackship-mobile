export const BASE_COORDS = {
  lat: 48.853229,
  lon: 2.225328,
};

export const ZONES = {
  zone1: 1000,  // 1 km
  zone2: 2000,  // 2 km
  zone3: 3000,  // 3 km
};

export const API_CONFIG = {
  // Backend Node.js Railway : Route unifiée pour récupérer les navires
  SHIPS_API_URL: 'https://api.bakabi.fr/ships',  // Railway (dev ET prod)

  // Backend Node.js Railway : Gestion notifications push
  // ⚠️ IMPORTANT: Même en DEV, utiliser Railway car on teste sur device réel
  PUSH_API_URL: 'https://api.bakabi.fr',  // Railway (dev ET prod)

  ENDPOINTS: {
    // Routes backend (Railway)
    SHIPS: '/ships',
    REGISTER_TOKEN: '/register-token',
    UNREGISTER_TOKEN: '/unregister-token',
    HEALTH: '/health',
  }
};

export const REFRESH_INTERVAL = 10000; // 10 secondes en ms
