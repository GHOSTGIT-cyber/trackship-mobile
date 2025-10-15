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
 * Demander permission et récupérer token Expo Push
 * @returns Token Expo ou undefined si échec
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

    // Récupérer token Expo
    console.log('🎫 Récupération token Expo...');
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('✅ Token Expo récupéré:', token);

      // Sauvegarder localement
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
      console.log('💾 Token sauvegardé dans AsyncStorage');
    } catch (tokenError: any) {
      console.error('❌ Erreur récupération token:', tokenError);
      Alert.alert('Erreur', `Impossible de récupérer le token push:\n${tokenError.message}`);
      return undefined;
    }

    // Envoyer token au backend
    console.log('\n📡 Envoi token au backend...');
    console.log(`   URL: ${API_CONFIG.PUSH_API_URL}${API_CONFIG.ENDPOINTS.REGISTER_TOKEN}`);
    console.log(`   Token: ${token.substring(0, 40)}...`);

    try {
      const response = await fetch(
        `${API_CONFIG.PUSH_API_URL}${API_CONFIG.ENDPOINTS.REGISTER_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }
      );

      console.log(`   Status HTTP: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token enregistré sur le serveur:', data);
        Alert.alert(
          '✅ Notifications activées !',
          `Votre token a été enregistré avec succès.\n\nToken: ${token.substring(0, 30)}...`,
          [{ text: 'OK' }]
        );
        return token;
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Erreur serveur lors de l\'enregistrement:', response.status, errorText);
        Alert.alert(
          'Avertissement',
          `Le serveur a retourné une erreur (${response.status}), mais le token local est valide.\n\nVous recevrez peut-être des notifications quand même.`,
          [{ text: 'OK' }]
        );
        return token;
      }
    } catch (networkError: any) {
      console.warn('⚠️ Erreur réseau:', networkError.message);
      Alert.alert(
        'Serveur injoignable',
        `Impossible de contacter le serveur push.\n\nToken local enregistré : ${token.substring(0, 30)}...\n\nErreur: ${networkError.message}`,
        [{ text: 'OK' }]
      );
      // Token récupéré localement, l'app peut continuer
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
