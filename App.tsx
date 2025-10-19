import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/services/pushNotifications';
import MapScreen from './src/screens/MapScreen';
import DebugScreen from './src/screens/DebugScreen';

// Mode debug activé via variable d'environnement EAS Build
const DEBUG_MODE = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';

export default function App() {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const [showDebug, setShowDebug] = useState(DEBUG_MODE);

  useEffect(() => {
    // DÉSACTIVÉ : Enregistrement token push désactivé au démarrage
    // Évite les crashes si le backend n'est pas disponible
    // L'utilisateur doit activer manuellement via le panneau notifications (bouton cloche)
    // registerForPushNotificationsAsync();

    // Listener : notification reçue (app ouverte)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue:', notification);
    });

    // Listener : user tape sur la notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapée:', response);
      // TODO : naviguer vers MapScreen (déjà affiché par défaut)
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {showDebug ? (
        // Mode Debug : Écran de test complet
        <DebugScreen onGoToMap={() => setShowDebug(false)} />
      ) : (
        // Mode Normal : App standard
        <>
          {/* Header stylisé */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#1e3a5f', '#2c5282', '#3b6ba8']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.headerTitle}>🛰️ TrackShip</Text>
              <Text style={styles.headerSubtitle}>Seine - Surveillance temps réel</Text>
            </LinearGradient>
          </View>

          <MapScreen />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    zIndex: 1000,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});
