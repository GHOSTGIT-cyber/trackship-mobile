import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, AppState } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import { Ship } from '../types/ship';
import { ZoneCircle } from '../components/ZoneCircle';
import { ShipMarker } from '../components/ShipMarker';
import { fetchShips } from '../services/api';
import { calculateDistance } from '../utils/distance';
import { BASE_COORDS, ZONES, REFRESH_INTERVAL } from '../constants/config';

const MapScreen: React.FC = () => {
  // State
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'moving' | 'stopped'>('all');

  // Refs pour les intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref pour tracker les navires déjà signalés en zone rouge
  const redZoneAlertedShips = useRef<Set<string>>(new Set());

  // Fonction pour jouer le son d'alerte
  const playAlertSound = async () => {
    try {
      // Vérifier que l'app est au premier plan
      if (AppState.currentState !== 'active') return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBy/LMeS0FJHbE7+GKQQ0RU6vn77FgHg4' },
        { shouldPlay: false }
      );

      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.error('[MapScreen] Erreur lecture son:', error);
    }
  };

  // Fonction pour charger les navires
  const loadShips = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchShips();
      setShips(data);

      // Vérifier les navires en zone rouge et jouer son si nouveau navire
      data.forEach(ship => {
        const dist = calculateDistance(
          BASE_COORDS.latitude,
          BASE_COORDS.longitude,
          ship.latitude,
          ship.longitude
        );

        if (dist < ZONES.ALERT) {
          // Navire en zone rouge
          if (!redZoneAlertedShips.current.has(ship.trackId)) {
            // Nouveau navire en zone rouge, jouer le son
            console.log(`[MapScreen] 🚨 Alerte ! Navire ${ship.name} en zone rouge (${Math.round(dist)}m)`);
            playAlertSound();
            redZoneAlertedShips.current.add(ship.trackId);
          }
        } else {
          // Navire sorti de la zone rouge, retirer de la liste
          redZoneAlertedShips.current.delete(ship.trackId);
        }
      });

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

  // Effect au mount : charge les navires
  useEffect(() => {
    // Chargement initial
    loadShips();
  }, []);

  // Effect pour gérer les intervals selon autoRefresh
  useEffect(() => {
    // Nettoyer les intervals existants
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Si autoRefresh est activé, démarrer les intervals
    if (autoRefresh) {
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
    } else {
      // Si désactivé, mettre countdown à 0
      setCountdown(0);
    }

    // Cleanup : arrêter les intervals
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  // Filtrer les navires selon le filtre actif
  const filteredShips = ships.filter(ship => {
    if (filter === 'all') return true;
    if (filter === 'moving') return ship.speed > 0.5;
    if (filter === 'stopped') return ship.speed <= 0.5;
    return true;
  });

  // Calculer les statistiques
  const stats = {
    total: ships.length,
    moving: ships.filter(s => s.speed > 0.5).length,
    stopped: ships.filter(s => s.speed <= 0.5).length,
    redZone: ships.filter(s => {
      const dist = calculateDistance(BASE_COORDS.latitude, BASE_COORDS.longitude, s.latitude, s.longitude);
      return dist < ZONES.ALERT;
    }).length,
    orangeZone: ships.filter(s => {
      const dist = calculateDistance(BASE_COORDS.latitude, BASE_COORDS.longitude, s.latitude, s.longitude);
      return dist >= ZONES.ALERT && dist < ZONES.VIGILANCE;
    }).length,
    greenZone: ships.filter(s => {
      const dist = calculateDistance(BASE_COORDS.latitude, BASE_COORDS.longitude, s.latitude, s.longitude);
      return dist >= ZONES.VIGILANCE && dist < ZONES.APPROACH;
    }).length,
  };

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
        {filteredShips.map((ship) => (
          <ShipMarker
            key={ship.trackId}
            ship={ship}
            baseCoords={BASE_COORDS}
          />
        ))}
      </MapView>

      {/* Filtres navires (top-center) */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'moving' && styles.filterButtonActive]}
          onPress={() => setFilter('moving')}
        >
          <Text style={[styles.filterText, filter === 'moving' && styles.filterTextActive]}>
            En mouvement
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'stopped' && styles.filterButtonActive]}
          onPress={() => setFilter('stopped')}
        >
          <Text style={[styles.filterText, filter === 'stopped' && styles.filterTextActive]}>
            À l'arrêt
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overlay compteur refresh (top-right) */}
      <View style={styles.refreshCounter}>
        <Text style={styles.overlayText}>
          {autoRefresh ? `Refresh dans ${countdown}s` : 'Mode pause'}
        </Text>
      </View>

      {/* Bouton ON/OFF pour refresh automatique */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setAutoRefresh(!autoRefresh)}
      >
        <Text style={styles.toggleIcon}>{autoRefresh ? '⏸️' : '▶️'}</Text>
      </TouchableOpacity>

      {/* Panneau statistiques */}
      <View style={styles.statsPanel}>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>Total navires : {stats.total}</Text>
          <Text style={styles.statsText}>En mouvement : {stats.moving}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>À l'arrêt : {stats.stopped}</Text>
          <Text style={styles.statsText}>Zone rouge : {stats.redZone}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>Zone orange : {stats.orangeZone}</Text>
          <Text style={styles.statsText}>Zone verte : {stats.greenZone}</Text>
        </View>
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
    top: 76,
    right: 70,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
  toggleButton: {
    position: 'absolute',
    top: 76,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 24,
  },
  filterContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  statsPanel: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 16,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    position: 'absolute',
    top: 76,
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
