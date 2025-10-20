import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, AppState, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ship } from '../types/ship';
import { ZoneCircle } from '../components/ZoneCircle';
import { ShipMarker } from '../components/ShipMarker';
import NotificationPanel from '../components/NotificationPanel';
import { fetchShips } from '../services/api';
import { calculateDistance } from '../utils/distance';
import { BASE_COORDS, ZONES, REFRESH_INTERVAL } from '../constants/config';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';

const MapScreen: React.FC = () => {
  // State
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'moving' | 'stopped'>('all');
  const [notificationPanelVisible, setNotificationPanelVisible] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // Refs pour les intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref pour tracker les navires déjà signalés en zone rouge
  const redZoneAlertedShips = useRef<Set<string>>(new Set());

  // Charger les préférences de notification depuis AsyncStorage au mount
  useEffect(() => {
    loadNotificationPreference();
  }, []);

  const loadNotificationPreference = async () => {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      if (value !== null) {
        setNotificationsEnabled(value === 'true');
      }
    } catch (error) {
      console.error('[MapScreen] Erreur chargement préférence notifications:', error);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      if (enabled) {
        // L'utilisateur active les notifications - enregistrer le token
        console.log('[MapScreen] Activation notifications - enregistrement token...');
        const token = await registerForPushNotificationsAsync();

        if (token) {
          // Token enregistré avec succès
          await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
          setNotificationsEnabled(true);
          console.log(`[MapScreen] ✅ Notifications activées avec token: ${token.substring(0, 30)}...`);
        } else {
          // Échec récupération token
          console.warn('[MapScreen] ⚠️ Impossible d\'enregistrer le token - notifications désactivées');
          await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
          setNotificationsEnabled(false);
        }
      } else {
        // L'utilisateur désactive les notifications
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
        setNotificationsEnabled(false);
        console.log('[MapScreen] Notifications désactivées');
      }
    } catch (error) {
      console.error('[MapScreen] Erreur toggle notifications:', error);
    }
  };

  // Fonction pour jouer le son d'alerte
  const playAlertSound = async () => {
    // Ne jouer le son que si les notifications sont activées
    if (!notificationsEnabled) return;

    try {
      // Vérifier que l'app est au premier plan
      if (AppState.currentState !== 'active') return;

      // Utiliser le son de notification système d'Expo
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        // Utiliser require avec un fichier audio local si disponible
        // Sinon utiliser une URL de notification
        { uri: 'https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3' },
        { shouldPlay: true, volume: 0.5 }
      );

      // Nettoyer après 2 secondes
      setTimeout(() => {
        sound.unloadAsync().catch((err) => {
          console.error('[MapScreen] Erreur unload son:', err);
        });
      }, 2000);
    } catch (error) {
      // Erreur silencieuse - ne pas crasher si le son ne charge pas
      console.error('[MapScreen] Erreur lecture son:', error);
      // Pas d'alerte à l'utilisateur - le son est optionnel
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
          BASE_COORDS.lat,
          BASE_COORDS.lon,
          ship.latitude,
          ship.longitude
        );

        if (dist < ZONES.zone1) {
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
    // Chargement initial avec protection anti-crash
    const init = async () => {
      try {
        await loadShips();
      } catch (error) {
        console.error('[MapScreen] Erreur initialisation:', error);
        // L'erreur est déjà gérée dans loadShips, mais on sécurise ici aussi
      }
    };
    init();
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

  // Filtrer les navires : d'abord par distance (< 3km), puis par filtre utilisateur
  const filteredShips = ships
    .filter(ship => {
      // Filtrer TOUS les navires au-delà de 3km
      const dist = calculateDistance(
        BASE_COORDS.lat,
        BASE_COORDS.lon,
        ship.latitude,
        ship.longitude
      );
      return dist < ZONES.zone3; // Seulement navires < 3km
    })
    .filter(ship => {
      // Ensuite appliquer le filtre utilisateur
      if (filter === 'all') return true;
      if (filter === 'moving') return ship.speed > 0.5;
      if (filter === 'stopped') return ship.speed <= 0.5;
      return true;
    });

  // Calculer les statistiques (seulement navires < 3km)
  const shipsIn3kmZone = ships.filter(s => {
    const dist = calculateDistance(BASE_COORDS.lat, BASE_COORDS.lon, s.latitude, s.longitude);
    return dist < ZONES.zone3;
  });

  const stats = {
    total: shipsIn3kmZone.length,
    moving: shipsIn3kmZone.filter(s => s.speed > 0.5).length,
    stopped: shipsIn3kmZone.filter(s => s.speed <= 0.5).length,
    redZone: shipsIn3kmZone.filter(s => {
      const dist = calculateDistance(BASE_COORDS.lat, BASE_COORDS.lon, s.latitude, s.longitude);
      return dist < ZONES.zone1;
    }).length,
    orangeZone: shipsIn3kmZone.filter(s => {
      const dist = calculateDistance(BASE_COORDS.lat, BASE_COORDS.lon, s.latitude, s.longitude);
      return dist >= ZONES.zone1 && dist < ZONES.zone2;
    }).length,
    greenZone: shipsIn3kmZone.filter(s => {
      const dist = calculateDistance(BASE_COORDS.lat, BASE_COORDS.lon, s.latitude, s.longitude);
      return dist >= ZONES.zone2 && dist < ZONES.zone3;
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
          latitude: BASE_COORDS.lat,
          longitude: BASE_COORDS.lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Marqueur de la base avec logo */}
        <Marker
          coordinate={{ latitude: BASE_COORDS.lat, longitude: BASE_COORDS.lon }}
          title="Base"
          description="Point de surveillance"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.baseLogo}
            resizeMode="contain"
          />
        </Marker>

        {/* Cercles de zones */}
        <ZoneCircle
          center={{ latitude: BASE_COORDS.lat, longitude: BASE_COORDS.lon }}
          radius={ZONES.zone1}
          color="red"
        />
        <ZoneCircle
          center={{ latitude: BASE_COORDS.lat, longitude: BASE_COORDS.lon }}
          radius={ZONES.zone2}
          color="orange"
        />
        <ZoneCircle
          center={{ latitude: BASE_COORDS.lat, longitude: BASE_COORDS.lon }}
          radius={ZONES.zone3}
          color="green"
        />

        {/* Marqueurs des navires */}
        {filteredShips.map((ship) => (
          <ShipMarker
            key={ship.trackId}
            ship={ship}
            baseCoords={{ latitude: BASE_COORDS.lat, longitude: BASE_COORDS.lon }}
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

      {/* Bouton cloche pour ouvrir le panneau notifications */}
      <TouchableOpacity
        style={styles.bellButton}
        onPress={() => setNotificationPanelVisible(true)}
      >
        <MaterialCommunityIcons
          name={notificationsEnabled ? "bell" : "bell-off"}
          size={24}
          color="white"
        />
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

      {/* Panneau de notifications */}
      <NotificationPanel
        visible={notificationPanelVisible}
        onClose={() => setNotificationPanelVisible(false)}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />
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
  baseLogo: {
    width: 50,
    height: 50,
  },
  refreshCounter: {
    position: 'absolute',
    top: 76,
    right: 128,
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
  bellButton: {
    position: 'absolute',
    top: 76,
    right: 72,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
