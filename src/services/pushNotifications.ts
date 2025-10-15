import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { API_CONFIG } from '../constants/config';

// Configurer le handler de notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Demander permission et récupérer token Expo Push
 * @returns Token Expo ou undefined si échec
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  try {
    let token;

    if (!Device.isDevice) {
      console.warn('⚠️ Les notifications push ne fonctionnent que sur un appareil réel');
      return undefined;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Permission refusée pour les notifications');
      return undefined;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('📱 Expo Push Token:', token);

    // Envoyer token au backend avec gestion d'erreur silencieuse
    try {
      const response = await fetch(
        `${API_CONFIG.PUSH_API_URL}${API_CONFIG.ENDPOINTS.REGISTER_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token enregistré sur le serveur:', data);
        return token;
      } else {
        console.warn('⚠️ Erreur serveur lors de l\'enregistrement:', response.status);
        // Token récupéré localement mais pas enregistré sur le backend (pas grave)
        return token;
      }
    } catch (networkError: any) {
      console.warn('⚠️ Impossible de contacter le serveur push:', networkError.message);
      // NE PAS CRASH - juste logger l'erreur
      // Token récupéré localement, l'app peut continuer à fonctionner
      return token;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }

    return token;
  } catch (error: any) {
    console.error('❌ Erreur critique lors de l\'enregistrement notifications:', error);
    // Silencieux - ne pas bloquer l'application
    return undefined;
  }
}

/**
 * Désenregistrer token (au logout par exemple)
 * @param token Token Expo à désenregistrer
 */
export async function unregisterPushToken(token: string): Promise<void> {
  try {
    await fetch(
      `${API_CONFIG.PUSH_API_URL}${API_CONFIG.ENDPOINTS.UNREGISTER_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }
    );
    console.log('✅ Token désinscrit');
  } catch (error) {
    console.error('❌ Erreur désinscription:', error);
  }
}
