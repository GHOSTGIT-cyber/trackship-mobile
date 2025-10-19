import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_CONFIG, BASE_COORDS } from '../constants/config';
import { fetchShips } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';
import { calculateDistance } from '../utils/distance';

interface DebugScreenProps {
  onGoToMap: () => void;
}

const DebugScreen: React.FC<DebugScreenProps> = ({ onGoToMap }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [logEntry, ...prev].slice(0, 50)); // Garder 50 derniers
  };

  const loadDebugInfo = async () => {
    addLog('🚀 Debug screen monté');

    // Device info
    const info = {
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      platformApiLevel: Device.platformApiLevel,
      isDevice: Device.isDevice,
    };
    setDeviceInfo(info);
    addLog(`📱 Device: ${info.manufacturer} ${info.modelName}`);
    addLog(`🤖 OS: ${info.osName} ${info.osVersion}`);

    // Permissions
    await checkPermissions();
  };

  const checkPermissions = async () => {
    addLog('🔐 Vérification permissions...');

    // Location
    const locationPerm = await Location.getForegroundPermissionsAsync();
    const notifPerm = await Notifications.getPermissionsAsync();

    const perms = {
      location: locationPerm.status,
      notifications: notifPerm.status,
    };

    setPermissions(perms);
    addLog(`📍 Location: ${perms.location}`);
    addLog(`🔔 Notifications: ${perms.notifications}`);
  };

  const testBackendHealth = async () => {
    setLoading('backend');
    addLog('🧪 Test Backend Railway...');

    try {
      const url = `${API_CONFIG.PUSH_API_URL}/health`;
      addLog(`   URL: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const startTime = Date.now();
      const response = await fetch(url, {
        signal: controller.signal,
      });
      const duration = Date.now() - startTime;

      clearTimeout(timeoutId);

      addLog(`   Status: ${response.status}`);
      addLog(`   Temps: ${duration}ms`);

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Backend OK: ${JSON.stringify(data)}`);
        Alert.alert('✅ Backend OK', `Réponse en ${duration}ms\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        addLog(`❌ Erreur ${response.status}`);
        Alert.alert('❌ Erreur', `Status: ${response.status}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addLog('⏱️ Timeout (>10s)');
        Alert.alert('⏱️ Timeout', 'Le backend ne répond pas (>10s)');
      } else {
        addLog(`❌ Erreur: ${error.message}`);
        Alert.alert('❌ Erreur', error.message);
      }
    } finally {
      setLoading(null);
    }
  };

  const testEuRISAPI = async () => {
    setLoading('euris');
    addLog('🧪 Test API EuRIS...');

    try {
      addLog(`   URL: ${API_CONFIG.EURIS_API_URL}`);
      addLog(`   Base coords: ${BASE_COORDS.lat}, ${BASE_COORDS.lon}`);

      const startTime = Date.now();
      const ships = await fetchShips();
      const duration = Date.now() - startTime;

      addLog(`   Temps: ${duration}ms`);
      addLog(`✅ ${ships.length} navires récupérés`);

      if (ships.length > 0) {
        const ship = ships[0];
        const distance = calculateDistance(BASE_COORDS.lat, BASE_COORDS.lon, ship.latitude, ship.longitude);
        addLog(`   Premier: ${ship.name} à ${Math.round(distance)}m`);
      }

      const shipsWithDistance = ships.slice(0, 3).map(s => {
        const dist = calculateDistance(BASE_COORDS.lat, BASE_COORDS.lon, s.latitude, s.longitude);
        return `${s.name} (${Math.round(dist)}m)`;
      });

      Alert.alert(
        '✅ API EuRIS OK',
        `${ships.length} navires trouvés en ${duration}ms\n\n${shipsWithDistance.join('\n')}`
      );
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
      Alert.alert('❌ Erreur API EuRIS', error.message);
    } finally {
      setLoading(null);
    }
  };

  const testLocation = async () => {
    setLoading('location');
    addLog('🧪 Test Localisation...');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      addLog(`   Permission: ${status}`);

      if (status !== 'granted') {
        addLog('❌ Permission refusée');
        Alert.alert('❌ Permission refusée', 'Activez la localisation dans les paramètres');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      addLog(`✅ Position: ${location.coords.latitude}, ${location.coords.longitude}`);
      addLog(`   Précision: ${location.coords.accuracy}m`);

      Alert.alert(
        '✅ Localisation OK',
        `Lat: ${location.coords.latitude}\nLon: ${location.coords.longitude}\nPrécision: ${location.coords.accuracy}m`
      );
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
      Alert.alert('❌ Erreur', error.message);
    } finally {
      setLoading(null);
    }
  };

  const testNotifications = async () => {
    setLoading('notifications');
    addLog('🧪 Test Notifications...');

    try {
      // Test notification locale
      addLog('   Test notification locale...');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Debug',
          body: 'Notification locale fonctionne !',
          sound: true,
        },
        trigger: null,
      });
      addLog('✅ Notification locale envoyée');

      // Test enregistrement token
      addLog('   Test enregistrement token...');
      const token = await registerForPushNotificationsAsync();

      if (token) {
        addLog(`✅ Token: ${token.substring(0, 30)}...`);
        Alert.alert('✅ Notifications OK', `Token enregistré:\n${token.substring(0, 40)}...`);
      } else {
        addLog('❌ Échec récupération token');
        Alert.alert('❌ Échec', 'Impossible de récupérer le token');
      }
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
      Alert.alert('❌ Erreur', error.message);
    } finally {
      setLoading(null);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Logs effacés');
  };

  const exportLogs = async () => {
    const logsText = logs.join('\n');
    await AsyncStorage.setItem('@debug_logs', logsText);
    addLog('💾 Logs sauvegardés');
    Alert.alert('✅ Sauvegardé', 'Logs sauvegardés dans AsyncStorage');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Debug TrackShip</Text>
        <Text style={styles.subtitle}>Version Ultra Debug</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Device</Text>
          <Text style={styles.infoText}>{deviceInfo.manufacturer} {deviceInfo.modelName}</Text>
          <Text style={styles.infoText}>{deviceInfo.osName} {deviceInfo.osVersion}</Text>
          <Text style={styles.infoText}>
            {deviceInfo.isDevice ? '✅ Device réel' : '⚠️ Émulateur'}
          </Text>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Permissions</Text>
          <Text style={styles.infoText}>
            Localisation: {permissions.location === 'granted' ? '✅' : '❌'} {permissions.location}
          </Text>
          <Text style={styles.infoText}>
            Notifications: {permissions.notifications === 'granted' ? '✅' : '❌'} {permissions.notifications}
          </Text>
        </View>

        {/* Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Tests</Text>

          <TouchableOpacity
            style={[styles.testButton, loading === 'backend' && styles.testButtonLoading]}
            onPress={testBackendHealth}
            disabled={!!loading}
          >
            <MaterialCommunityIcons name="server" size={20} color="white" />
            <Text style={styles.testButtonText}>
              {loading === 'backend' ? 'Test en cours...' : 'Test Backend Railway'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, loading === 'euris' && styles.testButtonLoading]}
            onPress={testEuRISAPI}
            disabled={!!loading}
          >
            <MaterialCommunityIcons name="ferry" size={20} color="white" />
            <Text style={styles.testButtonText}>
              {loading === 'euris' ? 'Test en cours...' : 'Test API EuRIS'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, loading === 'location' && styles.testButtonLoading]}
            onPress={testLocation}
            disabled={!!loading}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color="white" />
            <Text style={styles.testButtonText}>
              {loading === 'location' ? 'Test en cours...' : 'Test Localisation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, loading === 'notifications' && styles.testButtonLoading]}
            onPress={testNotifications}
            disabled={!!loading}
          >
            <MaterialCommunityIcons name="bell-ring" size={20} color="white" />
            <Text style={styles.testButtonText}>
              {loading === 'notifications' ? 'Test en cours...' : 'Test Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapButton} onPress={onGoToMap}>
            <MaterialCommunityIcons name="map" size={20} color="white" />
            <Text style={styles.testButtonText}>🗺️ Aller à la carte</Text>
          </TouchableOpacity>
        </View>

        {/* Logs */}
        <View style={styles.section}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>📋 Logs ({logs.length}/50)</Text>
            <View style={styles.logsButtons}>
              <TouchableOpacity style={styles.smallButton} onPress={clearLogs}>
                <MaterialCommunityIcons name="delete" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton} onPress={exportLogs}>
                <MaterialCommunityIcons name="content-save" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.logsContainer}>
            {logs.length === 0 ? (
              <Text style={styles.noLogs}>Aucun log</Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={styles.logText}>
                  {log}
                </Text>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e3a5f',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  testButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  testButtonLoading: {
    backgroundColor: '#94A3B8',
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#6B7280',
    padding: 6,
    borderRadius: 6,
  },
  logsContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#00ff00',
    marginBottom: 3,
  },
  noLogs: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default DebugScreen;
