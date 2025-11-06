# TrackShip Mobile

Application mobile React Native pour suivre les navires sur la Seine avec alertes de proximité et notifications push.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Build de l'application](#build-de-lapplication)
- [Installation sur appareil Android](#installation-sur-appareil-android)
- [Test de l'application](#test-de-lapplication)
- [Structure du projet](#structure-du-projet)
- [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Logiciels requis

- **Node.js** (v18 ou supérieur) - [Télécharger](https://nodejs.org/)
- **npm** ou **yarn** - Installé avec Node.js
- **Git** - [Télécharger](https://git-scm.com/)
- **Expo CLI** - Installé globalement : `npm install -g expo-cli`
- **EAS CLI** - Installé globalement : `npm install -g eas-cli`

### Pour tester sur Android

- **ADB (Android Debug Bridge)** - Inclus dans Android SDK Platform Tools
  - [Télécharger Android Platform Tools](https://developer.android.com/tools/releases/platform-tools)
  - Ajouter le dossier `platform-tools` au PATH système

### Comptes requis

- **Compte Expo** - [S'inscrire sur expo.dev](https://expo.dev/signup)
- **Compte Google Cloud** - Pour Google Maps API et Firebase
  - [Console Google Cloud](https://console.cloud.google.com/)
  - [Console Firebase](https://console.firebase.google.com/)

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/GHOSTGIT-cyber/trackship-mobile.git
cd trackship-mobile
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Se connecter à Expo

```bash
eas login
```

Entrez vos identifiants Expo.

## ⚙️ Configuration

### 1. Firebase Configuration

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com/)
2. Ajoutez une application Android au projet
3. Téléchargez le fichier `google-services.json`
4. Placez-le à la racine du projet : `trackship-mobile/google-services.json`

### 2. Google Maps API

L'application utilise actuellement la clé : `AIzaSyBkmZ3wGs6cEhe87QnFVX0ZfR3e4bH6cno`

**Pour utiliser votre propre clé :**

1. **Créer une clé API Google Maps :**
   - Allez sur [Google Cloud Console - API & Services](https://console.cloud.google.com/apis/credentials)
   - Créez une clé API
   - Activez **Maps SDK for Android**

2. **Configurer les restrictions (recommandé) :**
   - Type de restriction : **Applications Android**
   - Nom du package : `fr.bakabi.trackship`
   - Empreinte SHA-1 : Récupérez-la avec `eas credentials` (voir section Troubleshooting)

3. **Mettre à jour la clé dans le code :**

   Fichier `android/app/src/main/AndroidManifest.xml` (ligne 20) :
   ```xml
   <meta-data android:name="com.google.android.geo.API_KEY" android:value="VOTRE_CLE_API"/>
   ```

   Fichier `app.config.js` (ligne 38) :
   ```javascript
   return withGoogleMapsApiKey(baseConfig, 'VOTRE_CLE_API');
   ```

### 3. Variables d'environnement

Le fichier `.env` n'est pas nécessaire car la configuration est dans `app.json` et `app.config.js`.

## 🏗️ Build de l'application

### Build Android (APK)

#### Profil `ultradebug` (recommandé pour le développement)

```bash
eas build --platform android --profile ultradebug
```

Ce profil génère un APK installable directement, avec :
- Logs détaillés activés
- Mode debug activé
- Cleartext traffic autorisé (HTTP)
- Build en mode `internal`

#### Profil `preview`

```bash
eas build --platform android --profile preview
```

#### Profil `production`

```bash
eas build --platform android --profile production
```

### Suivre la progression du build

Le build se fait sur les serveurs Expo (EAS Build). La commande affichera :
- Un lien vers les logs : `https://expo.dev/accounts/.../builds/...`
- Un QR code pour installer l'APK une fois terminé
- Le temps estimé : ~5-7 minutes

### Télécharger l'APK

Une fois le build terminé :

**Option 1 : Via la commande EAS**
```bash
eas build:download --platform android
```

**Option 2 : Via le lien web**
Ouvrez le lien des logs et téléchargez l'APK depuis "Application Archive URL"

**Option 3 : Scanner le QR code**
Scannez le QR code affiché dans le terminal avec votre téléphone Android

## 📱 Installation sur appareil Android

### Méthode 1 : ADB (Recommandé pour le développement)

1. **Activer le mode développeur sur Android :**
   - Paramètres > À propos du téléphone
   - Appuyez 7 fois sur "Numéro de build"
   - Retournez dans Paramètres > Options de développement
   - Activez "Débogage USB"

2. **Connecter l'appareil en USB**

3. **Vérifier la connexion :**
   ```bash
   adb devices
   ```
   Vous devriez voir votre appareil listé.

4. **Installer l'APK :**
   ```bash
   adb install trackship-v7-newapi.apk
   ```

5. **Lancer l'application :**
   ```bash
   adb shell am start -n fr.bakabi.trackship/.MainActivity
   ```

### Méthode 2 : Installation manuelle

1. Transférez l'APK sur votre téléphone (USB, email, cloud...)
2. Ouvrez le fichier APK sur le téléphone
3. Autorisez l'installation depuis des sources inconnues si demandé
4. Appuyez sur "Installer"

### Méthode 3 : QR Code

Scannez le QR code généré après le build avec votre téléphone Android.

## 🧪 Test de l'application

### Écran de Debug (DebugScreen)

Au démarrage, l'application affiche un écran de debug avec :

#### Informations système
- **Device** : Modèle de l'appareil
- **OS** : Version Android
- **App version** : Version de l'application

#### Vérification des permissions

1. **📍 Location Permission**
   - **Test** : Vérifiez le statut affiché (granted/denied/undetermined)
   - **Action si denied** :
     - Appuyez sur "Demander permissions"
     - Autorisez la localisation quand demandé
     - Le statut doit passer à "granted"

2. **🔔 Notifications Permission**
   - **Test** : Vérifiez le statut
   - **Action si denied** :
     - Appuyez sur "Demander permissions"
     - Autorisez les notifications
     - Le statut doit passer à "granted"

3. **🔗 Connectivité réseau**
   - **Test** : Vérifiez que "Connected" est affiché
   - **Si déconnecté** : Activez le WiFi ou les données mobiles

#### Boutons de test

1. **"Demander permissions"**
   - **Test** : Cliquez sur ce bouton
   - **Résultat attendu** :
     - Popup système pour la localisation
     - Popup système pour les notifications
     - Statuts mis à jour après autorisation

2. **"Aller à la carte"**
   - **Test** : Cliquez sur ce bouton
   - **Résultat attendu** : Navigation vers l'écran de carte (MapScreen)

### Écran de Carte (MapScreen)

#### Affichage de la carte

1. **Tuiles Google Maps**
   - **Test** : La carte doit s'afficher avec les tuiles Google Maps
   - **Vérification** :
     - Fond de carte visible (rues, bâtiments)
     - Logo Google en bas à gauche
     - Pas d'écran beige
     - Possibilité de zoomer/dézoomer avec pinch
     - Possibilité de déplacer la carte

2. **Marqueur de base**
   - **Test** : Un logo (votre logo d'application) doit être visible au centre
   - **Position** : Coordonnées de la base de surveillance
   - **Interaction** : Cliquez dessus pour voir "Base - Point de surveillance"

3. **Cercles de zones**
   - **Zone rouge** (< 1 km) : Cercle rouge autour de la base
   - **Zone orange** (1-2 km) : Cercle orange
   - **Zone verte** (2-3 km) : Cercle vert
   - **Test** : Les 3 cercles concentriques doivent être visibles

#### Chargement des navires

1. **Chargement initial**
   - **Test** : Au chargement de la carte
   - **Résultat attendu** :
     - Indicateur de chargement (ActivityIndicator)
     - Message "Chargement de la carte..."
     - Puis affichage de la carte avec les navires

2. **Affichage des marqueurs de navires**
   - **Navires en mouvement** (vitesse > 0.5 nœuds) :
     - Icône : Speedboat orientée selon le cap
     - Couleur selon distance :
       - Rouge : < 1 km
       - Orange : 1-2 km
       - Vert : 2-3 km

   - **Navires arrêtés** (vitesse ≤ 0.5 nœuds) :
     - Icône : Carré bleu avec symbole pause
     - Taille fixe, pas de rotation

3. **Callout (Popup) des navires**
   - **Test** : Cliquez sur un marqueur de navire
   - **Informations affichées** :
     - Nom du navire
     - MMSI
     - Vitesse (en nœuds)
     - Cap (en degrés)
     - Distance depuis la base
     - Code couleur de zone (🔴/🟠/🟢)

#### Panneau de statistiques (en haut)

1. **Compteurs de navires**
   - **Total** : Nombre total de navires < 3km
   - **En mouvement** : Navires avec vitesse > 0.5 nœuds
   - **Arrêtés** : Navires avec vitesse ≤ 0.5 nœuds

2. **Zones de proximité**
   - **Zone rouge** : Nombre de navires < 1km
   - **Zone orange** : Nombre de navires entre 1-2km
   - **Zone verte** : Nombre de navires entre 2-3km

3. **Test** : Vérifiez que les compteurs correspondent aux marqueurs visibles

#### Filtres de navires

1. **Bouton "Tous"**
   - **Test** : Cliquez dessus
   - **Résultat** : Tous les navires < 3km affichés
   - **Indicateur** : Bouton en bleu

2. **Bouton "En mouvement"**
   - **Test** : Cliquez dessus
   - **Résultat** : Seuls les navires avec vitesse > 0.5 affichés
   - **Indicateur** : Bouton en bleu, autres en gris

3. **Bouton "Arrêtés"**
   - **Test** : Cliquez dessus
   - **Résultat** : Seuls les navires arrêtés affichés
   - **Indicateur** : Bouton en bleu

#### Auto-refresh

1. **Compteur de rafraîchissement**
   - **Affichage** : "Prochaine mise à jour dans : 10s" (décompte)
   - **Test** : Observez le décompte
   - **Résultat attendu** :
     - Décompte de 10 à 1
     - À 0, rechargement des données
     - Message "Chargement..." bref
     - Compteur repart à 10

2. **Bouton Play/Pause**
   - **Test** : Cliquez sur ⏸️ (pause)
   - **Résultat** :
     - Auto-refresh désactivé
     - Compteur à 0
     - Icône change en ▶️ (play)

   - **Test** : Cliquez sur ▶️ (play)
   - **Résultat** :
     - Auto-refresh réactivé
     - Compteur repart à 10
     - Icône change en ⏸️

3. **Bouton rafraîchir manuel** 🔄
   - **Test** : Cliquez dessus
   - **Résultat** :
     - Rechargement immédiat des données
     - Message "Chargement..."
     - Compteur reset à 10 (si auto-refresh actif)

#### Panneau de notifications

1. **Bouton cloche** 🔔 (en haut à droite)
   - **Test** : Cliquez dessus
   - **Résultat** : Panneau de notifications slide depuis la droite

2. **Toggle "Activer les notifications"**
   - **Test activé** : Activez le toggle
   - **Résultat** :
     - Enregistrement du token push
     - Log console : "✅ Notifications activées avec token: ..."
     - Préférence sauvegardée dans AsyncStorage

   - **Test désactivé** : Désactivez le toggle
   - **Résultat** :
     - Log console : "Notifications désactivées"
     - Pas de son d'alerte lors des alertes

3. **Fermeture du panneau**
   - **Test** : Cliquez en dehors du panneau
   - **Résultat** : Le panneau se ferme avec animation

#### Alertes de zone rouge

1. **Détection automatique**
   - **Condition** : Un navire entre dans la zone rouge (< 1km)
   - **Résultat attendu** :
     - Log console : "🚨 Alerte ! Navire [MMSI] en zone rouge (XXXm)"
     - Son d'alerte joué (si notifications activées)
     - Notification push envoyée (si token enregistré)

2. **Prévention des doublons**
   - **Test** : Le même navire reste en zone rouge
   - **Résultat** : L'alerte ne se répète pas à chaque refresh
   - **Vérification** : Un seul log par navire tant qu'il reste en zone rouge

### Surveillance via ADB Logcat

Pour voir les logs en temps réel pendant les tests :

```bash
adb -s [DEVICE_ID] logcat | grep ReactNativeJS
```

**Logs importants à surveiller :**

```
[API] Appel backend Railway /ships
[API] ✅ Réponse reçue
[API] Total: XX navires
[API] Zones - Rouge (<1km): X, Orange (1-2km): X, Vert (2-3km): X
[MapScreen] XX navires chargés
[MapScreen] 🚨 Alerte ! Navire Track XXXXX en zone rouge (XXXm)
[MapScreen] ✅ Notifications activées avec token: ExponentPushToken[...]
```

**Logs Google Maps (initialisation) :**

```
D MapsInitializer: preferredRenderer: LATEST
D AirMapRenderer: LATEST
I Google Android Maps SDK: Google Play services maps renderer version: 253425402
```

**Erreurs à surveiller :**

- ❌ `Authorization failure` → Problème de clé API
- ❌ `Error requesting API token` → Problème de configuration Maps
- ❌ `INVALID_ARGUMENT` → Clé API non valide ou mal configurée

## 📁 Structure du projet

```
trackship-mobile/
├── android/                      # Code natif Android (généré par prebuild)
│   ├── app/
│   │   ├── build.gradle         # Dépendances Google Play Services
│   │   └── src/main/
│   │       └── AndroidManifest.xml  # Clé API Google Maps (ligne 20)
├── assets/                       # Ressources statiques
│   ├── logo.png                 # Logo de l'application
│   └── speedboat.png            # Icône navire en mouvement
├── src/
│   ├── components/              # Composants réutilisables
│   │   ├── NotificationPanel.tsx    # Panneau de notifications
│   │   ├── ShipMarker.tsx          # Marqueur de navire sur carte
│   │   └── ZoneCircle.tsx          # Cercles de zones de proximité
│   ├── constants/               # Constantes de configuration
│   │   └── config.ts            # API URLs, coordonnées base, zones
│   ├── screens/                 # Écrans de l'application
│   │   ├── DebugScreen.tsx      # Écran de debug et permissions
│   │   └── MapScreen.tsx        # Écran principal avec carte
│   ├── services/                # Services et API
│   │   ├── api.ts               # Appels API backend (navires)
│   │   └── pushNotifications.ts # Gestion notifications push
│   ├── types/                   # Types TypeScript
│   │   └── ship.ts              # Interface Ship
│   └── utils/                   # Utilitaires
│       └── distance.ts          # Calcul distance haversine
├── .gitignore                   # Fichiers ignorés par Git
├── app.config.js                # Config Expo avec plugin Maps (clé API ligne 38)
├── app.json                     # Configuration Expo principale
├── App.tsx                      # Point d'entrée de l'application
├── eas.json                     # Configuration EAS Build
├── google-services.json         # Configuration Firebase
├── package.json                 # Dépendances npm
└── tsconfig.json               # Configuration TypeScript
```

## 🐛 Troubleshooting

### Build échoue avec "google-services.json is missing"

**Solution :** Le fichier `google-services.json` doit être à la racine du projet ET committé dans Git.

```bash
git add google-services.json
git commit -m "Add google-services.json"
git push
```

### Carte affiche écran beige avec logo Google

**Cause :** Problème de clé API Google Maps

**Solutions :**

1. **Vérifier que Maps SDK for Android est activé :**
   - https://console.cloud.google.com/apis/library/maps-android-backend.googleapis.com

2. **Vérifier la clé dans AndroidManifest.xml :**
   ```bash
   grep "com.google.android.geo.API_KEY" android/app/src/main/AndroidManifest.xml
   ```

3. **Tester sans restriction :**
   - Dans Google Cloud Console, mettez temporairement "Aucune restriction"
   - Si ça fonctionne, le problème vient des restrictions (SHA-1 ou package name)

### Récupérer l'empreinte SHA-1 du keystore EAS

```bash
# Depuis un APK installé sur appareil
adb -s [DEVICE_ID] shell dumpsys package fr.bakabi.trackship | grep -A 20 "signatures"
```

L'empreinte actuelle (keystore EAS) : `A3:EA:9F:A0:8F:6C:4D:B2:49:BA:AF:00:2B:F9:33:94:25:E3:B0:49`

### Les navires ne s'affichent pas

**Vérifications :**

1. **Connexion réseau :**
   ```bash
   adb -s [DEVICE_ID] shell ping -c 4 8.8.8.8
   ```

2. **Logs API :**
   ```bash
   adb logcat | grep -i "API"
   ```
   Vous devriez voir : `[API] ✅ Réponse reçue`

3. **Vérifier l'URL backend dans** `src/constants/config.ts` :
   ```typescript
   export const RAILWAY_BACKEND_URL = 'https://api.bakabi.fr';
   ```

### react-native-maps ne compile pas

**Cause :** Dépendances Google Play Services manquantes

**Solution :** Vérifier dans `android/app/build.gradle` (lignes 160-161) :

```gradle
implementation 'com.google.android.gms:play-services-maps:18.1.0'
implementation 'com.google.android.gms:play-services-location:21.0.1'
```

Si manquantes, ajoutez-les et rebuilez.

### "Failed to install APK" via ADB

**Solutions :**

1. **Désinstaller l'ancienne version d'abord :**
   ```bash
   adb uninstall fr.bakabi.trackship
   adb install nom-du-fichier.apk
   ```

2. **Vérifier que l'appareil est bien connecté :**
   ```bash
   adb devices
   ```

3. **Réactiver le débogage USB sur l'appareil**

### Notifications ne fonctionnent pas

**Vérifications :**

1. **Permission accordée :**
   - Vérifier dans DebugScreen : "Notifications: granted"

2. **Token Expo généré :**
   - Logs : "✅ Notifications activées avec token: ExponentPushToken[...]"

3. **Notifications activées dans le panneau :**
   - Ouvrir le panneau de notifications (bouton 🔔)
   - Toggle "Activer les notifications" doit être ON

4. **Firebase configuré :**
   - `google-services.json` présent
   - Project ID dans le fichier correspond au projet Firebase

### Impossible de lancer le build EAS

**Erreur courante :** `Not logged in`

**Solution :**
```bash
eas login
```

**Erreur :** `No eas.json found`

**Solution :** Vérifier que vous êtes dans le bon dossier :
```bash
cd trackship-mobile
```

## 📝 Notes importantes

### Versions actuelles

- **Expo SDK** : 54.0.0
- **React Native** : 0.76.3
- **react-native-maps** : 1.18.0
- **Google Play Services Maps** : 18.1.0
- **Node.js** : v18+ recommandé

### Clé API Google Maps actuelle

```
AIzaSyBkmZ3wGs6cEhe87QnFVX0ZfR3e4bH6cno
```

Cette clé est configurée pour :
- Package Android : `fr.bakabi.trackship`
- SHA-1 : `A3:EA:9F:A0:8F:6C:4D:B2:49:BA:AF:00:2B:F9:33:94:25:E3:B0:49`

### Backend API

L'application se connecte à deux backends :

1. **Railway (navires AIS)** : `https://api.bakabi.fr/ships`
2. **Hostinger PHP (EuRIS)** : `https://euris.bakabi.fr/api.php` (non utilisé actuellement)

### Refresh automatique

- Intervalle par défaut : 10 secondes
- Configurable dans `src/constants/config.ts` : `REFRESH_INTERVAL`

### Zones de proximité

Définies dans `src/constants/config.ts` :

```typescript
export const ZONES = {
  zone1: 1000,  // Rouge : < 1 km
  zone2: 2000,  // Orange : 1-2 km
  zone3: 3000,  // Vert : 2-3 km
};
```

### Point de surveillance (base)

Coordonnées actuelles :
```typescript
export const BASE_COORDS = {
  lat: 48.8566,
  lon: 2.3522,
};
```

## 🚀 Déploiement production

Pour créer un build de production signé :

1. **Configurer le keystore de production dans EAS**

2. **Build production :**
   ```bash
   eas build --platform android --profile production
   ```

3. **Soumettre au Play Store :**
   ```bash
   eas submit --platform android
   ```

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs : `adb logcat | grep ReactNativeJS`
- Consulter la documentation Expo : https://docs.expo.dev/
- Documentation react-native-maps : https://github.com/react-native-maps/react-native-maps

---

**Dernière mise à jour** : 6 novembre 2025
**Version** : 1.0.0
