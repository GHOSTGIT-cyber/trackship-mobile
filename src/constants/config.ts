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
  // Backend PHP Hostinger : Proxy EuRIS pour récupérer les navires
  EURIS_API_URL: 'https://bakabi.fr/trackship/api/euris-proxy.php',

  // Backend Node.js Railway : Gestion notifications push
  PUSH_API_URL: __DEV__
    ? 'http://localhost:3000'  // Dev local (si tu lances server.js en local)
    : 'https://api.bakabi.fr',  // Production Railway

  ENDPOINTS: {
    // Routes backend notifications (Railway)
    REGISTER_TOKEN: '/register-token',
    UNREGISTER_TOKEN: '/unregister-token',
    HEALTH: '/health',
  }
};

export const REFRESH_INTERVAL = 10000; // 10 secondes en ms
