import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { Ship } from '../types/ship';
import { ZoneCircle } from '../components/ZoneCircle';
import { ShipMarker } from '../components/ShipMarker';
import { fetchShips } from '../services/api';
import { calculateDistance } from '../utils/distance';
import { BASE_COORDS, ZONES, REFRESH_INTERVAL } from '../constants/config';

export const MapScreen: React.FC = () => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

  // TODO: Implémenter useEffect pour le fetch initial et le refresh automatique
  // TODO: Implémenter la logique de sélection de navire
  // TODO: Implémenter le rendu de la carte avec MapView

  return (
    <View style={styles.container}>
      {/* TODO: Ajouter MapView, ZoneCircle, ShipMarker */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
