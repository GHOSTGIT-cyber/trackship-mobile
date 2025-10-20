import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { ShipsResponse, Ship } from '../types/ship';

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
      console.log(`[API] ✅ ${response.data.ships.length} navires retournés`);
      return response.data.ships;
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
