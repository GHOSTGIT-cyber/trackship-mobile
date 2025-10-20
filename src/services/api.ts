import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { ShipsResponse, Ship } from '../types/ship';

/**
 * Transforme les données du backend Railway vers le format attendu par l'app
 * Backend renvoie: lat/lon, speed peut être null
 * App attend: latitude/longitude, speed doit être un nombre
 */
function transformShipData(backendShip: any): Ship {
  return {
    trackId: backendShip.trackId,
    name: backendShip.name,
    latitude: backendShip.lat,       // lat → latitude
    longitude: backendShip.lon,      // lon → longitude
    speed: backendShip.speed ?? 0,   // null → 0
    course: backendShip.course ?? 0, // null → 0
    length: backendShip.length ?? 0,
    width: backendShip.width ?? 0,
    moving: backendShip.moving,
    distance: backendShip.distance,
    distanceKm: backendShip.distanceKm,
    heading: backendShip.heading,
  };
}

/**
 * Récupère la liste des navires depuis le backend Railway (/ships)
 * Le backend gère automatiquement le filtrage par bbox autour de la base
 * @returns Liste des navires
 * @throws Error en cas d'erreur réseau ou serveur
 */
export async function fetchShips(): Promise<Ship[]> {
  try {
    console.log('[API] Appel backend Railway /ships');
    console.log('[API] URL:', API_CONFIG.SHIPS_API_URL);

    const response = await axios.get<ShipsResponse>(API_CONFIG.SHIPS_API_URL, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('[API] ✅ Réponse reçue');
    console.log(`[API] Total: ${response.data.total} navires`);
    console.log(`[API] Zones - Rouge (<1km): ${response.data.zones.zone1km}, Orange (1-2km): ${response.data.zones.zone2km}, Vert (2-3km): ${response.data.zones.zone3km}, Hors zone (>3km): ${response.data.zones.beyond3km}`);

    // Le backend retourne déjà les ships formatés avec distance calculée
    if (response.data.success && Array.isArray(response.data.ships)) {
      // Transformer les données backend vers le format attendu par l'app
      const transformedShips = response.data.ships.map(transformShipData);

      console.log(`[API] ✅ ${transformedShips.length} navires transformés`);

      return transformedShips;
    }

    console.warn('[API] ⚠️ Format réponse inattendu:', response.data);
    return [];

  } catch (error: any) {
    if (error.response) {
      // Erreur HTTP (400, 500, etc.)
      console.error('[API] ❌ Erreur HTTP:', error.response.status, error.response.data);
      throw new Error(`Erreur serveur (${error.response.status})`);
    } else if (error.request) {
      // Pas de réponse (timeout, réseau)
      console.error('[API] ❌ Pas de réponse serveur');
      throw new Error('Erreur de connexion');
    } else {
      // Autre erreur
      console.error('[API] ❌ Erreur:', error.message);
      throw new Error('Erreur inconnue');
    }
  }
}
