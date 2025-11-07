import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';

const EXPO_PUSH_TOKEN_KEY = '@expo_push_token';

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
 * Demander permission et récupérer token Firebase Cloud Messaging
 * @returns Token FCM natif ou undefined si échec
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  console.log('\n🔔 === DÉBUT ENREGISTREMENT NOTIFICATIONS ===');

  try {
    let token;

    // Vérifier si c'est un device réel
    if (!Device.isDevice) {
      console.warn('⚠️ Pas un device réel (simulateur/émulateur)');
      Alert.alert(
        'Notifications désactivées',
        'Les notifications push ne fonctionnent que sur un appareil physique réel.',
        [{ text: 'OK' }]
      );
      return undefined;
    }
    console.log('✅ Device réel détecté');
    console.log(`📱 Device: ${Device.brand || 'Unknown'} ${Device.modelName || 'Unknown'}`);
    console.log(`🤖 OS: ${Platform.OS} ${Platform.Version}`);

    // Vérifier permissions actuelles
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log(`📋 Permissions actuelles: ${existingStatus}`);

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('❓ Demande de permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log(`📋 Nouvelles permissions: ${finalStatus}`);
    }

    if (finalStatus !== 'granted') {
      console.error('❌ Permissions refusées par l\'utilisateur');
      Alert.alert(
        'Permissions refusées',
        'Vous devez autoriser les notifications dans les paramètres de l\'application.',
        [{ text: 'OK' }]
      );
      return undefined;
    }
    console.log('✅ Permissions notifications OK');

    // Configurer canal Android AVANT de récupérer le token
    if (Platform.OS === 'android') {
      console.log('🤖 Configuration canal Android...');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
      console.log('✅ Canal Android configuré');
    }

    // Récupérer token Device Push (FCM natif via Expo)
    console.log('🎫 Récupération token Device Push (FCM natif)...');
    console.log('   Ceci peut prendre 5-10 secondes...');
    try {
      // Utiliser getDevicePushTokenAsync qui retourne le token FCM natif
      // au lieu de getExpoPushTokenAsync qui retourne un token Expo proxy
      const tokenPromise = Notifications.getDevicePushTokenAsync();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout 15s dépassé')), 15000)
      );

      const devicePushToken = await Promise.race([tokenPromise, timeoutPromise]);
      token = devicePushToken.data; // Token FCM natif

      console.log('✅ Token Device Push (FCM) récupéré:', token.substring(0, 50) + '...');
      console.log('   Type:', devicePushToken.type); // 'fcm' pour Android
      console.log('   Longueur token:', token.length, 'caractères');

      // Sauvegarder localement
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
      console.log('💾 Token sauvegardé dans AsyncStorage');
    } catch (tokenError: any) {
      console.error('❌ Erreur récupération token Device Push:', tokenError);
      console.error('   Type:', tokenError.name);
      console.error('   Message:', tokenError.message);
      Alert.alert('Erreur', `Impossible de récupérer le token push:\n${tokenError.message}`);
      return undefined;
    }

    // ============================================
    // ENREGISTREMENT BACKEND AVEC RETRY
    // ============================================
    console.log('\n📡 Enregistrement backend avec retry...');
    const url = `${API_CONFIG.PUSH_API_URL}${API_CONFIG.ENDPOINTS.REGISTER_TOKEN}`;
    console.log(`   URL: ${url}`);
    console.log(`   Token: ${token.substring(0, 40)}...`);

    // Fonction retry avec délais croissants
    const registerWithRetry = async (maxRetries: number = 3): Promise<any> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`\n🔄 Tentative ${attempt}/${maxRetries}...`);

          // Timeout de 15 secondes (Railway peut être lent au réveil)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log(`   Status HTTP: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCÈS backend:', data);

            Alert.alert(
              '✅ Notifications activées',
              'Vous recevrez une alerte quand un navire entre dans la zone rouge (1 km).',
              [{ text: 'OK' }]
            );

            return { success: true, data };
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
            console.warn(`⚠️ Erreur ${response.status}:`, errorData);

            // Si erreur serveur (500+), retry
            if (response.status >= 500 && attempt < maxRetries) {
              const retryDelay = attempt * 3;
              console.log(`   ⏳ Attente ${retryDelay}s avant retry...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
              continue;
            }

            throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
          }

        } catch (error: any) {
          console.error(`❌ Tentative ${attempt} échouée:`, error.message);

          if (error.name === 'AbortError') {
            console.warn('   ⏱️ Timeout (15s dépassé)');
          }

          if (attempt < maxRetries) {
            const delay = attempt * 5; // 5s, 10s, 15s
            console.log(`   ⏳ Attente ${delay}s avant retry (backend peut être en réveil)...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
          } else {
            // Dernier essai échoué
            throw error;
          }
        }
      }

      throw new Error('Échec après ' + maxRetries + ' tentatives');
    };

    // Lancer l'enregistrement avec retry
    try {
      await registerWithRetry(3);
      return token;
    } catch (finalError: any) {
      console.error('❌ ÉCHEC FINAL après 3 tentatives:', finalError.message);

      Alert.alert(
        '⚠️ Serveur injoignable',
        `Impossible de contacter le serveur push après 3 tentatives.\n\nToken local enregistré : ${token.substring(0, 20)}...\n\nErreur: ${finalError.message}\n\nVous pouvez réessayer plus tard via le bouton dans le panneau notifications.`,
        [{ text: 'OK' }]
      );

      // Token récupéré localement mais pas enregistré backend
      // L'user peut réessayer via le bouton "Réessayer" dans le panneau
      return token;
    }

  } catch (error: any) {
    console.error('❌ Erreur critique:', error);
    Alert.alert('Erreur critique', `Une erreur inattendue s'est produite:\n${error.message}`);
    return undefined;
  } finally {
    console.log('🔔 === FIN ENREGISTREMENT NOTIFICATIONS ===\n');
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
