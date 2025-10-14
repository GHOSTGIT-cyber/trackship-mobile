# Build TrackShip - Instructions complètes

## Prérequis
- Compte Expo : https://expo.dev (gratuit)
- Node.js installé
- Projet trackship-mobile prêt

## Installation EAS CLI
```bash
npm install -g eas-cli
```

## Configuration (première fois)
```bash
# 1. Login Expo
eas login

# 2. Dans le dossier trackship-mobile
cd trackship-mobile

# 3. Configurer EAS (créera app.json extra.eas.projectId)
eas build:configure
```

## Build Android APK (test)
```bash
eas build --platform android --profile preview
```

⏳ Durée : 15-20 minutes
📥 Résultat : Lien téléchargement APK

## Build iOS TestFlight (après Android OK)
```bash
eas build --platform ios --profile preview
```

⚠️ Nécessite compte Apple Developer (99$/an)

## Surveiller le build
```bash
# Liste des builds
eas build:list

# Ou dashboard web
https://expo.dev
```

## Installer l'APK sur Android

### Méthode 1 - Cable USB
1. Télécharge APK depuis le lien EAS
2. Connecte Android en USB
3. Copie APK sur téléphone
4. Ouvre "Mes fichiers" → Téléchargements
5. Clique APK → Installer
6. Autorise "Sources inconnues" si demandé

### Méthode 2 - Lien direct
1. Ouvre lien EAS sur Android
2. Télécharge APK
3. Installe directement

## Tester l'app
1. Ouvre TrackShip
2. Accepte permissions (Localisation + Notifications)
3. Vérifie carte + navires
4. Active notifications (bouton cloche)
5. Attends notification quand navire entre zone 3km

## Troubleshooting

### Build échoue
- Vérifier app.json et eas.json
- `npm install` propre
- Relancer `eas build:configure`

### APK ne s'installe pas
- Android 5.0+ requis (API 21)
- Désinstaller ancienne version
- Vérifier espace stockage

### Pas de navires affichés
- Vérifier connexion Internet
- Tester API : https://bakabi.fr/trackship/api/euris-proxy.php
- Vérifier permissions localisation

### Notifications ne marchent pas
- Vérifier permissions dans Paramètres Android
- Ouvrir panneau notifications dans l'app
- Activer le toggle

## Scripts npm disponibles

```bash
# Démarrer Expo
npm start

# Build Android APK
npm run build:android

# Build iOS
npm run build:ios
```

## Notes importantes

- **Package ID** : `fr.bakabi.trackship`
- **Version actuelle** : 1.0.0
- **Android versionCode** : 1
- **Backend API** : https://bakabi.fr/trackship/api/euris-proxy.php
- **Push API** : https://api.bakabi.fr

## Prochaines étapes après premier build

1. Tester APK sur appareil Android physique
2. Vérifier toutes les fonctionnalités :
   - Affichage carte et navires
   - Zones de 1km, 2km, 3km
   - Marqueurs speedboat avec rotation
   - Panneau notifications
   - Son d'alerte en zone rouge
3. Corriger bugs si nécessaires
4. Build production si tout OK
5. Build iOS si disponible
