import axios from 'axios';
import { API_URL } from '../constants/config';
import { ApiResponse, Ship } from '../types/ship';

/**
 * Récupère la liste des navires depuis l'API
 * @returns Liste des navires
 * @throws Error en cas d'erreur réseau ou serveur
 */
export async function fetchShips(): Promise<Ship[]> {
  try {
    // Configuration de la requête axios
    const response = await axios.get<ApiResponse>(API_URL, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 15000 // 15 secondes
    });

    // Parse la réponse
    if (response.data && response.data.tracks) {
      console.log(`[API] ${response.data._metadata.trackCount} navires récupérés`);
      return response.data.tracks;
    }

    // Si pas de tracks, retourne tableau vide
    console.warn('[API] Aucun navire dans la réponse');
    return [];

  } catch (error) {
    // Log pour debug
    console.error('[API] Erreur lors de la récupération des navires:', error);

    // Gestion des erreurs axios
    if (axios.isAxiosError(error)) {
      // Erreur réseau (pas de réponse)
      if (!error.response) {
        throw new Error('Erreur de connexion');
      }

      // Erreur serveur (400/500)
      if (error.response.status >= 400) {
        throw new Error('Erreur serveur');
      }
    }

    // Autres erreurs
    throw new Error('Erreur de connexion');
  }
}
