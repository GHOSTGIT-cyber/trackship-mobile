# Icônes TrackShip

## Source

✅ **Logo Foil'in Paris** (logo.png)
- Fichier source: `assets/logo.png` (500x500 pixels)
- Design: Logo noir et blanc "Foil'in PARIS"
- Format: PNG avec transparence (RGBA)

## Fichiers générés

Les icônes suivantes ont été générées automatiquement à partir du logo Foil'in Paris :

### 1. icon.png (1024x1024)
- **Usage**: Icône principale de l'application
- **Format**: PNG RGBA
- **Description**: Logo centré sur fond blanc avec marges de 112px
- **Taille logo**: 800x800px dans un canvas 1024x1024

### 2. adaptive-icon.png (1024x1024)
- **Usage**: Icône Android adaptive (foreground layer)
- **Format**: PNG RGBA avec transparence
- **Description**: Logo centré avec safe zone Android respectée
- **Taille logo**: 700x700px dans un canvas 1024x1024
- **Note**: La zone sûre (66% du cercle) garantit que le logo reste visible même avec masques Android

### 3. splash.png (1284x2778)
- **Usage**: Écran de chargement (splash screen)
- **Format**: PNG RGB
- **Description**: Logo centré sur fond bleu marine (#2c3e50)
- **Taille logo**: 600x600px centré verticalement et horizontalement
- **Orientation**: Portrait (iPhone 14 Pro Max et équivalents)

### 4. notification-icon.png (96x96)
- **Usage**: Icône de notification Android
- **Format**: PNG RGBA
- **Description**: Logo redimensionné à 96x96 pixels
- **Note**: Version simplifiée pour affichage dans les notifications système

## Configuration app.json

Les icônes sont configurées dans `app.json` :

```json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png",
    "backgroundColor": "#2c3e50"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#3B82F6"
    }
  },
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "color": "#3B82F6"
      }
    ]
  ]
}
```

## Régénération des icônes

Si tu dois modifier les icônes (nouveau logo, nouvelles dimensions, etc.) :

### Méthode automatique (recommandé)

```bash
# Remplacer assets/logo.png par le nouveau logo
# Puis exécuter le script de génération :
python generate_icons.py
```

Le script `generate_icons.py` :
- Charge `assets/logo.png`
- Génère automatiquement les 4 icônes aux bonnes dimensions
- Respecte les safe zones et recommandations de chaque plateforme

### Méthode manuelle

Si tu préfères créer les icônes manuellement :

1. **icon.png** : Logo sur fond blanc, 1024x1024, marges 112px
2. **adaptive-icon.png** : Logo centré 700x700 dans 1024x1024 transparent
3. **splash.png** : Logo 600x600 centré dans 1284x2778 fond #2c3e50
4. **notification-icon.png** : Logo redimensionné 96x96

## Rebuild nécessaire

⚠️ **Important**: Après modification des icônes, tu DOIS rebuilder l'APK/IPA pour voir les changements.

```bash
# Android APK
eas build --platform android --profile preview

# iOS IPA
eas build --platform ios --profile preview
```

Les icônes ne sont PAS mises à jour dans Expo Go - uniquement dans les builds natifs.

## Couleurs de la marque TrackShip

- **Bleu marine (splash)**: #2c3e50 (44, 62, 80)
- **Bleu (adaptive icon bg)**: #3B82F6 (59, 130, 246)
- **Blanc (icon bg)**: #FFFFFF (255, 255, 255)

## Notes techniques

### Safe zones Android

Les adaptive icons Android utilisent différentes formes de masque selon le fabricant (cercle, carré arrondi, squircle). Pour garantir que le logo reste visible :

- **Zone sûre**: Cercle de 66% du diamètre total
- **Logo maximal**: 700x700px dans canvas 1024x1024
- **Centrage**: Obligatoire

### Dimensions splash screen

Le splash screen utilise les dimensions de l'iPhone 14 Pro Max (1284x2778) qui sont compatibles avec la plupart des écrans modernes iOS et Android en mode portrait.

## Historique

- **15/10/2025**: Génération initiale des icônes depuis logo Foil'in Paris
- Source originale: 500x500 pixels
- Upscaling: LANCZOS pour qualité maximale
- Script: `generate_icons.py` (Python + Pillow)
