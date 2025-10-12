import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ship } from '../types/ship';
import { ZoneCircle } from '../components/ZoneCircle';
import { ShipMarker } from '../components/ShipMarker';
import { fetchShips } from '../services/api';
import { BASE_COORDS, ZONES, REFRESH_INTERVAL } from '../constants/config';

const MapScreen: React.FC = () => {
  // State
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  // Refs pour les intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour charger les navires
  const loadShips = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchShips();
      setShips(data);

      console.log(`[MapScreen] ${data.length} navires chargés`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[MapScreen] Erreur chargement navires:', message);
      // Garde les anciennes données en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Effect au mount : charge les navires et démarre les intervals
  useEffect(() => {
    // Chargement initial
    loadShips();

    // Interval de refresh (toutes les 10 secondes)
    refreshIntervalRef.current = setInterval(() => {
      loadShips();
      setCountdown(10); // Reset le countdown
    }, REFRESH_INTERVAL);

    // Interval du countdown (chaque seconde)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 10; // Reset à 10 quand arrive à 0
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup : arrêter les intervals
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Si loading première fois (pas de navires encore)
  if (loading && ships.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: BASE_COORDS.latitude,
          longitude: BASE_COORDS.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Marqueur de la base */}
        <Marker
          coordinate={BASE_COORDS}
          title="Base"
          description="Point de surveillance"
        >
          <Text style={styles.baseMarker}>🏭</Text>
        </Marker>

        {/* Cercles de zones */}
        <ZoneCircle
          center={BASE_COORDS}
          radius={ZONES.ALERT}
          color="red"
        />
        <ZoneCircle
          center={BASE_COORDS}
          radius={ZONES.VIGILANCE}
          color="orange"
        />
        <ZoneCircle
          center={BASE_COORDS}
          radius={ZONES.APPROACH}
          color="green"
        />

        {/* Marqueurs des navires */}
        {ships.map((ship) => (
          <ShipMarker
            key={ship.trackId}
            ship={ship}
            baseCoords={BASE_COORDS}
          />
        ))}
      </MapView>

      {/* Overlay compteur refresh (top-right) */}
      <View style={styles.refreshCounter}>
        <Text style={styles.overlayText}>Refresh dans {countdown}s</Text>
      </View>

      {/* Overlay nombre de navires (bottom-center) */}
      <View style={styles.shipCounter}>
        <Text style={styles.overlayText}>{ships.length} navires détectés</Text>
      </View>

      {/* Message d'erreur si présent */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  baseMarker: {
    fontSize: 32,
  },
  refreshCounter: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
  shipCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(220,53,69,0.9)',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MapScreen;
