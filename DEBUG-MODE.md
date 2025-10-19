# 🔍 Mode Debug TrackShip

## Qu'est-ce que c'est ?

Le mode **ultradebug** est un build spécial de TrackShip qui démarre sur un écran de diagnostic complet au lieu de la carte. Cet écran permet de tester chaque composant individuellement pour identifier rapidement les problèmes.

## Comment lancer le build ultradebug

```bash
cd trackship-mobile
eas build --platform android --profile ultradebug
```

⏳ **Durée** : 15-20 minutes
📥 **Résultat** : APK avec écran de debug au démarrage

## Fonctionnalités de l'écran debug

### 📱 Informations Device
- Marque et modèle
- Version Android
- Type (device réel vs émulateur)

### 🔐 Statut Permissions
- Localisation : ✅ granted / ❌ denied
- Notifications : ✅ granted / ❌ denied

### 🧪 Tests Disponibles

#### 1. Test Backend Railway
- URL : `https://api.bakabi.fr/health`
- Timeout : 10 secondes
- Vérifie : Connectivité backend + temps de réponse
- **Détecte** : Backend en veille, erreurs réseau

#### 2. Test API EuRIS
- URL : `https://bakabi.fr/trackship/api/euris-proxy.php`
- Vérifie : Récupération navires + calcul distance
- Affiche : 3 premiers navires avec distance
- **Détecte** : Problèmes API, erreurs de parsing

#### 3. Test Localisation
- Demande permission si nécessaire
- Récupère position GPS actuelle
- Affiche : Lat/Lon + précision
- **Détecte** : Permissions refusées, GPS désactivé

#### 4. Test Notifications
- Envoie notification locale immédiate
- Lance enregistrement token backend
- Affiche : Token Expo Push
- **Détecte** : Permissions refusées, échec enregistrement

### 📋 Console de Logs
- Affiche les 50 derniers logs
- Format : `[HH:MM:SS] Message`
- Couleur verte sur fond noir (style terminal)
- **Boutons** :
  - 🗑️ Effacer logs
  - 💾 Sauvegarder dans AsyncStorage

### 🗺️ Bouton "Aller à la carte"
- Passe en mode normal (MapScreen)
- Ferme l'écran debug
- L'app fonctionne normalement ensuite

## Différence entre les builds

| Build | Écran démarrage | Usage |
|-------|----------------|-------|
| `ultradebug` | DebugScreen | Diagnostic complet |
| `preview` | MapScreen | Test normal |
| `production` | MapScreen | Production |

## Variable d'environnement

Le mode debug est activé via :
```json
{
  "env": {
    "EXPO_PUBLIC_DEBUG_MODE": "true"
  }
}
```

Dans le code :
```typescript
const DEBUG_MODE = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
```

## Scénario d'utilisation

### Problème : Notifications ne marchent pas

**Étape 1** : Build ultradebug
```bash
eas build --platform android --profile ultradebug
```

**Étape 2** : Installer APK sur Android

**Étape 3** : Ouvrir app → DebugScreen s'affiche

**Étape 4** : Vérifier sections
- 📱 Device : Confirmer "✅ Device réel"
- 🔐 Permissions : Vérifier Notifications granted

**Étape 5** : Test Backend
- Cliquer "Test Backend Railway"
- Si timeout → Backend en veille
- Si erreur → Problème URL ou réseau

**Étape 6** : Test Notifications
- Cliquer "Test Notifications"
- Voir notification locale apparaître
- Vérifier token enregistré
- Consulter logs pour erreurs

**Étape 7** : Analyser logs
- Chercher messages d'erreur rouges
- Noter les timeouts
- Sauvegarder logs si nécessaire

**Étape 8** : Si tout OK
- Cliquer "🗺️ Aller à la carte"
- Tester fonctionnement normal

## Fichiers modifiés

- `src/screens/DebugScreen.tsx` (nouveau)
- `App.tsx` (route conditionnelle)
- `eas.json` (profile ultradebug)

## Commandes

```bash
# Build debug
eas build --platform android --profile ultradebug

# Build normal
eas build --platform android --profile preview

# Build production
eas build --platform android --profile production
```

## Notes

- Le mode debug est **UNIQUEMENT** activé dans le build ultradebug
- Les builds preview/production démarrent normalement sur MapScreen
- Les logs sont limités à 50 entrées pour éviter surcharge mémoire
- Les tests utilisent des timeouts courts (10-15s) pour détecter rapidement les problèmes
