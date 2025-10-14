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
  let token;

  if (!Device.isDevice) {
    alert('Les notifications push ne fonctionnent que sur un appareil réel');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permission refusée pour les notifications');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('📱 Expo Push Token:', token);

  // Envoyer token au backend
  try {
    const response = await fetch(
      `${API_CONFIG.PUSH_API_URL}${API_CONFIG.ENDPOINTS.REGISTER_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }
    );

    const data = await response.json();
    console.log('✅ Token enregistré:', data);
  } catch (error) {
    console.error('❌ Erreur enregistrement token:', error);
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  return token;
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
