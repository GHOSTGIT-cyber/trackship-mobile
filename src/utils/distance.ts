/**
 * Calcule la distance entre deux coordonnées GPS (formule de Haversine)
 * @param lat1 Latitude du point 1
 * @param lon1 Longitude du point 1
 * @param lat2 Latitude du point 2
 * @param lon2 Longitude du point 2
 * @returns Distance en mètres
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Rayon de la Terre en mètres
  const R = 6371000;

  // Conversion des degrés en radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  // Formule de Haversine
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance en mètres
  const distance = R * c;

  return distance;
}

/**
 * Retourne la couleur de zone selon la distance
 * @param distance Distance en mètres
 * @returns Couleur ('red', 'orange', 'green', 'gray')
 */
export function getZoneColor(distance: number): string {
  if (distance < 1000) {
    return 'red'; // Zone alerte (< 1km)
  }
  if (distance < 2000) {
    return 'orange'; // Zone vigilance (< 2km)
  }
  if (distance < 3000) {
    return 'green'; // Zone approche (< 3km)
  }
  return 'gray'; // Hors zone
}

/**
 * Détermine si un navire est en mouvement
 * @param speed Vitesse en nœuds
 * @returns true si en mouvement (vitesse > 0.5 kn)
 */
export function isMoving(speed: number): boolean {
  return speed > 0.5;
}
