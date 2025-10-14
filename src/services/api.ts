import axios from 'axios';
import { API_CONFIG, BASE_COORDS } from '../constants/config';
import { ApiResponse, Ship } from '../types/ship';

/**
 * Récupère la liste des navires depuis l'API EuRIS (backend PHP)
 * @returns Liste des navires
 * @throws Error en cas d'erreur réseau ou serveur
 */
export async function fetchShips(): Promise<Ship[]> {
  try {
    // Calcul bbox autour de la base (rayon 5km)
    const radiusInKm = 5;
    const latDelta = radiusInKm / 111; // ~0.045
    const lonDelta = radiusInKm / (111 * Math.cos(BASE_COORDS.lat * Math.PI / 180)); // ~0.065

    const params = {
      minLat: (BASE_COORDS.lat - latDelta).toFixed(6),
      maxLat: (BASE_COORDS.lat + latDelta).toFixed(6),
      minLon: (BASE_COORDS.lon - lonDelta).toFixed(6),
      maxLon: (BASE_COORDS.lon + lonDelta).toFixed(6),
      pageSize: 100
    };

    console.log('[API] Appel EuRIS avec params:', params);

    const response = await axios.get<ApiResponse>(API_CONFIG.EURIS_API_URL, {
      params: params,
      timeout: 15000,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('[API] Réponse reçue:', response.data);

    // Parse réponse
    if (response.data && response.data.tracks && Array.isArray(response.data.tracks)) {
      console.log(`[API] ${response.data.tracks.length} navires récupérés`);
      return response.data.tracks;
    }

    console.warn('[API] Format réponse inattendu:', response.data);
    return [];

  } catch (error: any) {
    if (error.response) {
      // Erreur HTTP (400, 500, etc.)
      console.error('[API] Erreur HTTP:', error.response.status, error.response.data);
      throw new Error(`Erreur serveur (${error.response.status})`);
    } else if (error.request) {
      // Pas de réponse (timeout, réseau)
      console.error('[API] Pas de réponse serveur');
      throw new Error('Erreur de connexion');
    } else {
      // Autre erreur
      console.error('[API] Erreur:', error.message);
      throw new Error('Erreur inconnue');
    }
  }
}
