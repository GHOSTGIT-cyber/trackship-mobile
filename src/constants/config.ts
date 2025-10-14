export const BASE_COORDS = {
  latitude: 48.853229,
  longitude: 2.225328
};

// Backend Railway - endpoint pour récupérer les navires (EuRIS proxy)
export const API_URL = 'https://trackship-backend-production.up.railway.app/api/euris-proxy';
// TODO : Changer pour https://api.bakabi.fr/api/euris-proxy quand DNS propagé

export const ZONES = {
  ALERT: 1000,      // 1km en mètres
  VIGILANCE: 2000,  // 2km
  APPROACH: 3000    // 3km
};

export const REFRESH_INTERVAL = 10000; // 10 secondes en ms
